import Route from '@ember/routing/route';


export default class PublicationsPublicationProofsRoute extends Route {
  model() {
    return this.modelFor('publications.publication').publicationSubcase;
  }
}
