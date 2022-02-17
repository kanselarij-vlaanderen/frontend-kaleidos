import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsRoute extends Route {
  async model() {
    return await this.modelFor('publications.publication').translationSubcase;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
