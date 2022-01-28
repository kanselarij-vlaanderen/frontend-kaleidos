import Route from '@ember/routing/route';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  model() {
    return this.modelFor('publications.publication').publicationSubcase;
  }
}
