import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { TrackedArray } from 'tracked-built-ins';
import { containsConfidentialPieces } from 'frontend-kaleidos/utils/documents';

export default class CasesSubmissionsSubmissionRoute extends Route {
  @service currentSession;
  @service router;
  @service store;
  @service submissionService;
  @service draftSubmissionService;

  newPieces;
  pieces;
  mandatees;
  statusChangeActivities;
  currentLinkedMandatee;

  async beforeModel(_transition) {
    if (!this.currentSession.may('view-submissions')) {
      this.router.transitionTo('cases.index');
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

    const status = await submission.belongsTo('status').reload();
    // querying here to get around cache issue.
    this.subcase = await this.store.queryOne('subcase', {
      'filter[:has:created]': `date-added-for-cache-busting-${new Date().toISOString()}`,
      'filter[submissions][:id:]': submission.id
    });
    if (status.uri === CONSTANTS.SUBMISSION_STATUSES.BEHANDELD) {
      if (this.subcase)  {
        let allDraftPiecesAccepted = await this.draftSubmissionService.allDraftPiecesAccepted(this.subcase);
        if (allDraftPiecesAccepted) {
          const decisionmakingFlow = await this.subcase.decisionmakingFlow;
          return this.router.transitionTo(
            'cases.case.subcases.subcase',
            decisionmakingFlow.id,
            this.subcase.id
          );
        }
      }
    }

    const mandatees = await submission.mandatees;
    this.mandatees = mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

    await submission.requestedBy;

    if (submission.confidential) {
      if (!this.currentSession.may('view-all-submissions')) {
        if (this.currentLinkedMandatee && this.mandatees.length) {
          const mandateeUris = this.mandatees.map((mandatee) => mandatee.uri);
          if (!mandateeUris.includes(this.currentLinkedMandatee.uri)) {
            this.router.transitionTo('submissions');
          }
        } else {
          this.router.transitionTo('submissions');
        }
      }
    }

    this.confidential = submission.confidential;
    const newPieces = await submission.pieces;
    this.hasConfidentialPieces = await containsConfidentialPieces(newPieces.slice());
    let pieces = [];
    if (this.subcase) {
      pieces = await this.submissionService.loadSubmissionPieces(this.subcase, newPieces);
    } else {
      pieces = newPieces.slice();
    }

    this.pieces = await sortPieces(pieces);

    let documentContainerIds = new TrackedArray([]);
    for (const piece of this.pieces) {
      const documentContainer = await piece.documentContainer;
      if (documentContainer && !documentContainerIds.includes(documentContainer.id)) {
        documentContainerIds.push(documentContainer.id);
      }
    }
    this.documentContainerIds = documentContainerIds;
    for (const newPiece of newPieces) {
      await newPiece.documentContainer;
    }
    const sortedNewPieces = newPieces?.slice().sort(
      (p1, p2) => p1.documentContainer.get('position') - p2.documentContainer.get('position')
    );
    this.newDraftPieces = sortedNewPieces;

    this.statusChangeActivities = await this.draftSubmissionService.getStatusChangeActivities(submission);
    this.beingTreatedBy = await this.draftSubmissionService.getLatestTreatedBy(submission, true);
    this.isUpdate = await this.draftSubmissionService.getIsUpdate(submission);

    if (this.isUpdate && this.subcase) {
      let subcaseMandatees = await this.subcase.mandatees;
      subcaseMandatees = subcaseMandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority);
      this.previousMandateePersons = await Promise.all(
        subcaseMandatees.map((m) => m.person)
      );
    }
    return submission;
  }

  async afterModel(model) {
    const decisionmakingFlow = await model.belongsTo('decisionmakingFlow').reload();
    await decisionmakingFlow?.case;
    if (this.currentSession.may('treat-and-accept-submissions')) {
      await model.internalReview;
    }
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.pieces = this.pieces;
    controller.documentContainerIds = this.documentContainerIds;
    controller.newDraftPieces = this.newDraftPieces;
    controller.statusChangeActivities = this.statusChangeActivities;
    controller.currentLinkedMandatee = this.currentLinkedMandatee;
    controller.beingTreatedBy = this.beingTreatedBy;
    controller.isUpdate = this.isUpdate;
    controller.subcase = this.subcase;
    controller.confidential = this.confidential;
    controller.hasConfidentialPieces = this.hasConfidentialPieces;
    controller.previousMandateePersons = this.previousMandateePersons;
    controller.approvalAddresses = _model.approvalAddresses;
    controller.notificationAddresses = _model.notificationAddresses;
    controller.approvalComment = _model.approvalComment;
    controller.notificationComment = _model.notificationComment;
  }
}
