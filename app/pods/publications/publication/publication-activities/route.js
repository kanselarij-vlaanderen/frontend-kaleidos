import Route from '@ember/routing/route';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  async model() {
    return await this.modelFor('publications.publication').publicationSubcase;
  }

  async afterModel() {
    this.publicationFlow = await this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
