import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationRoute extends Route {
  @service currentPublicationFlow;
  @service publicationService;

  async model(params) {
    await this.currentPublicationFlow.load(params.publication_id);
  }

  deactivate(){
    this.currentPublicationFlow.unload();
  }

  async afterModel() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.currentPublicationFlow.publicationFlow);
  }

  setupController(ctrl) {
    ctrl.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
