import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service publicationService;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this._case = await model.case;
    await this._case.governmentAreas;
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(model);
    this.agendaItemTreatment = await model.agendaItemTreatment;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller._case = this._case;
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
    controller.agendaItemTreatment = this.agendaItemTreatment;
  }
}
