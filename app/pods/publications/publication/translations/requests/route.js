import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsRequestRoute extends Route {
  model() {
    this.translationSubcase = this.modelFor('publications.publication.translations');
    this.publicationSubcase = this.modelFor('publications.publication').publicationSubcase;

    return this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'translation-activity,translation-activity.generated-pieces,translation-activity.generated-pieces.file,email,used-pieces,used-pieces.file',
        sort: '-start-date',
      }
    );
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.translationSubcase = this.translationSubcase;
    controller.publicationSubcase = this.publicationSubcase;
  }
}
