import Route from '@ember/routing/route';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  async model() {
    this.publicationFlow = this.modelFor('publications.publication');
    const publicationSubcase = this.publicationFlow.publicationSubcase;
    return publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
