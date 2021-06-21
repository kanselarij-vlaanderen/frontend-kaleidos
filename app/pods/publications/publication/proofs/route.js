import Route from '@ember/routing/route';


export default class PublicationProofsRoute extends Route {
  model() {
    return this.modelFor('publications.publication').publicationSubcase;
  }
}
