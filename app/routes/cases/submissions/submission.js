import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesSubmissionsSubmissionRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  pieces;
  mandatees;
  statusChangeActivities;
  currentLinkedMandatee;
  defaultAccessLevel;

  async beforeModel(_transition) {
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
    if (status.uri === CONSTANTS.SUBMISSION_STATUSES.AANVAARD) {
      const subcase = await submission.subcase;
      if (subcase)  {
        const decisionmakingFlow = await subcase.decisionmakingFlow;
        return this.router.transitionTo(
          'cases.case.subcases.subcase',
          decisionmakingFlow.id,
          subcase.id
        );
      }
    }

    await submission.requestedBy;

    const mandatees = await submission.mandatees;
    this.mandatees = mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

    const pieces = await submission.pieces;
    await Promise.all(
      pieces.map(async (piece) => await piece.documentContainer)
    );
    this.pieces = pieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });

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

    return submission;
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.pieces = this.pieces;
    controller.statusChangeActivities = this.statusChangeActivities;
    controller.currentLinkedMandatee = this.currentLinkedMandatee;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
