import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsRoute extends Route {
  model() {
    return this.modelFor('publications.publication').translationSubcase;
  }


  beforeModel() {
    this.transitionTo('publications.publication.translations.documents');
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
