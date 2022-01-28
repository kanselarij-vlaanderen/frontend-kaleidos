import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  @service currentPublicationFlow;

  model() {
    return this.currentPublicationFlow.publicationFlow.publicationSubcase;
  }
}
