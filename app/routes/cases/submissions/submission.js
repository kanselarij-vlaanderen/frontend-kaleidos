import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesSubmissionsSubmissionRoute extends Route {
  @service currentSession;
  @service store;

  pieces;
  mandatees;
  currentLinkedMandatee;

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

    return submission;
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.pieces = this.pieces;
    controller.currentLinkedMandatee = this.currentLinkedMandatee;
  }
}
