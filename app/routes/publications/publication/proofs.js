import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsRoute extends Route {
  model() {
    return this.modelFor('publications.publication').publicationSubcase;
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
