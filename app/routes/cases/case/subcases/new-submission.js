import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesCaseSubcasesNewSubmissionRoute extends Route {
  @service currentSession;
  @service store;

  submitter;
  mandatees;

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
    this.submitter = ministerPresident ?? linkedMandatees.slice().at(0);
    this.mandatees = this.submitter ? [this.submitter] : [];
  }

  async model() {
    const { decisionmakingFlow, subcases} = this.modelFor('cases.case');
    let latestSubcase;
    if (decisionmakingFlow && subcases?.length) {
      latestSubcase = subcases[subcases.length - 1];
    }
    return { decisionmakingFlow, latestSubcase };
  }

  async afterModel(model) {
    if (model.latestSubcase) {
      const subcaseMandatees = await model.latestSubcase.mandatees;
      for (const subcaseMandatee of subcaseMandatees) {
        let found = false;
        const subcaseMandateePerson = await subcaseMandatee.person;
        for (const existingMandatee of this.mandatees) {
          const existingMandateePerson = await existingMandatee.person;
          if (existingMandateePerson.id === subcaseMandateePerson.id) {
            found = true;
            break;
          }
        }
        if (!found) {
          this.mandatees.push(subcaseMandatee);
        }
      }
    }
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.submitter = this.submitter;
    controller.mandatees = this.mandatees;
    controller.latestSubcase = this.latestSubcase;
  }
}
