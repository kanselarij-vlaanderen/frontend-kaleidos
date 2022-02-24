import Route from '@ember/routing/route';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  model() {
    const publicationFlow = this.modelFor('publications.publication');
    const publicationSubcase = publicationFlow.publicationSubcase;
    return publicationSubcase;
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
