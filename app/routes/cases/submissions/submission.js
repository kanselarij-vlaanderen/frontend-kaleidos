import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class CasesSubmissionsSubmissionRoute extends Route {
  @service currentSession;
  @service router;
  @service store;
  @service submissionService;

  newPieces;
  pieces;
  mandatees;
  statusChangeActivities;
  currentLinkedMandatee;
  defaultAccessLevel;

  async beforeModel(_transition) {
    if (!this.currentSession.may('view-submissions')) {
      this.router.transitionTo('index');
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
    this.currentLinkedMandatee =
      ministerPresident ?? linkedMandatees.slice().at(0);
  }

  async model(params) {
    const submission = await this.store.findRecord(
      'submission',
      params.submission_id
    );

    const status = await submission.status;
    const subcase = await submission.subcase;
    if (status.uri === CONSTANTS.SUBMISSION_STATUSES.AANVAARD) {
      if (subcase)  {
        const decisionmakingFlow = await subcase.decisionmakingFlow;
        return this.router.transitionTo(
          'cases.case.subcases.subcase',
          decisionmakingFlow.id,
          subcase.id
        );
      }
    }

    const decisionmakingFlow = await submission.decisionmakingFlow;
    const subcases = await decisionmakingFlow?.subcases;
    const sortedSubcases = subcases?.slice()
      .sort((s1, s2) => s2.created.getTime() - s1.created.getTime())
    if (sortedSubcases?.length) {
      this.previousSubcase = sortedSubcases[0];
    }

    const mandatees = await submission.mandatees;
    this.mandatees = mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

    await submission.requestedBy;

    if (!this.currentSession.may('view-all-submissions')) {
      if (this.currentLinkedMandatee && this.mandatees.length) {
        const mandateeUris = this.mandatees.map((mandatee) => mandatee.uri);
        if (!mandateeUris.includes(this.currentLinkedMandatee.uri)) {
          this.router.transitionTo('cases.submissions');
        }
      } else {
        this.router.transitionTo('cases.submissions');
      }
    }

    const newPieces = await submission.pieces;
    let pieces = [];
    if (subcase) {
      pieces = await this.submissionService.loadSubmissionPieces(subcase, newPieces);
    } else {
      pieces = newPieces.slice();
    }

    this.pieces = await sortPieces(pieces);

    let documentContainerIds = [];
    for (const piece of this.pieces) {
      const documentContainer = await piece.documentContainer;
      if (documentContainer && !documentContainerIds.includes(documentContainer.id)) {
        documentContainerIds.push(documentContainer.id);
      }
    }
    this.documentContainerIds = documentContainerIds;
    this.newDraftPieces = newPieces;

    const statusChangeActivities = await submission.statusChangeActivities;
    this.statusChangeActivities = statusChangeActivities
      .slice()
      .sort((a1, a2) => a1.startedAt.getTime() - a2.startedAt.getTime())
      .reverse();
    await Promise.all(this.statusChangeActivities.map((a) => a.status));

    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      submission.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );


    const creator = await submission.creator;
    this.creatorName = `${creator?.firstName} ${creator?.lastName}`;

    return submission;
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.pieces = this.pieces;
    controller.documentContainerIds = this.documentContainerIds;
    controller.newDraftPieces = this.newDraftPieces;
    controller.statusChangeActivities = this.statusChangeActivities;
    controller.currentLinkedMandatee = this.currentLinkedMandatee;
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.previousSubcase = this.previousSubcase;
    controller.creatorName = this.creatorName;
  }
}
