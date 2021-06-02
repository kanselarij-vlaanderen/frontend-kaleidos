import Route from '@ember/routing/route';

export default class PublicationTranslationRoute extends Route {
  async model() {
    return this.modelFor('publications.publication').translationSubcase;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
