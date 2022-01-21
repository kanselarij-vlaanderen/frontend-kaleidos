import Route from '@ember/routing/route';

export default class PublicationsRoute extends Route {
  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel() {
    this.publicationSubcase = await this.modelFor('publications.publication').publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationSubcase = this.publicationSubcase;
  }
}
