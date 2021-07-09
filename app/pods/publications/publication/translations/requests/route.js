import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsRequestRoute extends Route {
  model() {
    this.translationSubcase = this.modelFor('publications.publication.translations');

    return this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'translation-activity,translation-activity.generated-pieces,translation-activity.generated-pieces.file,email,used-pieces,used-pieces.file',
        sort: '-start-date',
      }
    );
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = await this.publicationFlow.publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationSubcase = this.translationSubcase;
    controller.publicationSubcase = this.publicationSubcase;
  }
}
