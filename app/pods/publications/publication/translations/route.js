import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationTranslationsRoute extends Route {
  @service currentPublicationFlow;
  model() {
    return this.currentPublicationFlow.publicationFlow.translationSubcase;
  }
}
