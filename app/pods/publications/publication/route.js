import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationRoute extends Route {
  @service currentPublicationFlow;

  model(params) {
    this.currentPublicationFlow.load(params.publication_id);
  }
}
