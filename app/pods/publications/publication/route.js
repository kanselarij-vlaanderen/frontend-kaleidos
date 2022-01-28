import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationRoute extends Route {
  @service currentPublicationFlow;

  async model(params) {
    await this.currentPublicationFlow.load(params.publication_id);
  }

  deactivate(){
    this.currentPublicationFlow.unload();
  }
}
