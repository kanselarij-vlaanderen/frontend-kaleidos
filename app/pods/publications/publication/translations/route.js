import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsRoute extends Route {
  model() {
    const translationSubcase = this.modelFor('publications.publication').translationSubcase;
    translationSubcase.get('endDate') ? this.translationFinished = true : this.translationFinished = false;
    return translationSubcase;
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationFinished = this.translationFinished;
  }
}
