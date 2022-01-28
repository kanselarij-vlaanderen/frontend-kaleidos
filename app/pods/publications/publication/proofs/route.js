import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationProofsRoute extends Route {
  @service currentPublicationFlow;
  model() {
    return this.currentPublicationFlow.publicationFlow.publicationSubcase;
  }
}
