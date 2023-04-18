import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;
  @service('current-session') currentSession;

  mayAccessKabinetDocument = true;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const model = await this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
    if (this.currentSession.isKabinetDossierBeheerder) {
      const accessLevel = await model?.accessLevel;
      if (accessLevel.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) {
        const submissionActivity = await this.store.queryOne('submission-activity', {
          filter: {
            pieces: {
              ':id:': model?.id,
            },
          },
        });
        if (this.submissionActivity) {
          this.mayAccessKabinetDocument = false;
          const subcase = await submissionActivity.subcase;
          const mandatees = await subcase.mandatees;
          const currentUserOrganization = await this.currentSession.organization;
          const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
          for (let i = 0; i < currentUserOrganizationMandatees.length; i++) {
            if (mandatees.includes(currentUserOrganizationMandatees[i]) != -1) {
              this.mayAccessKabinetDocument = true;
              break;
            }
          }
        }
      }
    }
    return model;
  }

  async afterModel(model) {
    this.decisionActivity = await this.store.queryOne('decision-activity', {
      filter: {
        report: {
          ':id:': model?.id,
        },
      },
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionActivity = this.decisionActivity;
    controller.mayAccessKabinetDocument = this.mayAccessKabinetDocument;
  }
}
