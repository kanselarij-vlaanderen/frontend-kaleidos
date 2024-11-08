import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObjects } from 'frontend-kaleidos/utils/array-helpers';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { TrackedArray } from 'tracked-built-ins';

export default class CasesCaseSubcasesSubcaseNewSubmissionRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @service draftSubmissionService;

  pieces;
  defaultAccessLevel;
  submitter;
  mandatees;
  originalSubmission;
  approvalAddresses;
  approvalComment;
  notificationAddresses;
  notificationComment;

  async beforeModel(_transition) {
    if (!this.currentSession.may('create-submissions')) {
      if (this.currentSession.may('view-submissions')) {
        return this.router.transitionTo('submissions');
      }
      return this.router.transitionTo('cases.index');
    }
    const linkedMandatees = await this.store.queryAll('mandatee', {
      'filter[user-organizations][:id:]': this.currentSession.organization.id,
      'filter[:has-no:end]': true,
      include: 'mandate.role',
      sort: 'start',
    });
    const ministerPresident = linkedMandatees.find((mandatee) => {
      const mandate = mandatee.belongsTo('mandate').value();
      const role = mandate?.belongsTo('role')?.value();
      return role?.uri === CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT;
    });
    this.submitter = ministerPresident ?? linkedMandatees.slice().at(0);
    this.mandatees = this.submitter ? [this.submitter] : [];

    const { subcase } = this.modelFor('cases.case.subcases.subcase');
    const canSubmitNewDocuments = await this.draftSubmissionService.canSubmitNewDocumentsOnSubcase(subcase);
    if (!canSubmitNewDocuments) {
      const currentSubmission = await this.draftSubmissionService.getLatestSubmissionForSubcase(subcase);
      if (currentSubmission?.id) {
        return this.router.transitionTo('cases.submissions.submission', currentSubmission?.id);
      } else {
        return this.router.transitionTo('cases.case.subcases.subcase');
      }
    }
  }

  async model() {
    const { subcase } = this.modelFor('cases.case.subcases.subcase');

    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Get any submission-activity that is not yet on a meeting
    const submissionActivitiesWithoutActivity = await this.store.query(
      'submission-activity',
      {
        'filter[subcase][:id:]': subcase.id,
        'filter[:has-no:agenda-activity]': true,
        include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      }
    );
    let submissionActivities = [...submissionActivitiesWithoutActivity.slice()];
    // Get the submission-activity from latest meeting if applicable
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      this.latestMeeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]':
          latestActivity.id,
        sort: '-planned-start',
      });
      const submissionActivitiesFromLatestMeeting = await this.store.query(
        'submission-activity',
        {
          'filter[subcase][:id:]': subcase.id,
          'filter[agenda-activity][:id:]': latestActivity.id,
          include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
        }
      );
      addObjects(
        submissionActivities,
        submissionActivitiesFromLatestMeeting.slice()
      );
    }

    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      for (const piece of submissionPieces) {
        const nextPiece = await piece.nextPiece;
        if (!nextPiece)
          pieces.push(piece);
      }
    }

    this.pieces = await sortPieces(pieces, {
      isPreKaleidos: this.latestMeeting?.isPreKaleidos,
    });

    const subcaseMandatees = await subcase.mandatees;
    for (const subcaseMandatee of subcaseMandatees) {
      let found = false;
      const subcaseMandateePerson = await subcaseMandatee.person;
      for (const mandatee of this.mandatees) {
        const existingMandateePerson = await mandatee.person;
        if (existingMandateePerson.id === subcaseMandateePerson.id) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.mandatees.push(subcaseMandatee);
      }
    }

    this.mandatees = this.mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

    // TODO verify this change. It makes sense that we check the latest submission to copy addresses rather than the original
    this.previousSubmission = await this.draftSubmissionService.getLatestSubmissionForSubcase(subcase); // used to get addresses here
    this.originalSubmission = await this.draftSubmissionService.getOriginalSubmissionForSubcase(subcase); // used to get meeting in controller

    if (this.previousSubmission) {
      this.approvalAddresses = this.previousSubmission.approvalAddresses;
      this.approvalComment = this.previousSubmission.approvalComment;
      this.notificationAddresses = this.previousSubmission.notificationAddresses;
      this.notificationComment = this.previousSubmission.notificationComment;
    }

    return subcase;
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.pieces = new TrackedArray(this.pieces.slice());
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.requestedBy = this.submitter;
    controller.mandatees = this.mandatees;
    controller.originalSubmission = this.originalSubmission;
    controller.approvalAddresses = this.approvalAddresses;
    controller.approvalComment = this.approvalComment;
    controller.notificationAddresses = this.notificationAddresses;
    controller.notificationComment = this.notificationComment;
  }
}
