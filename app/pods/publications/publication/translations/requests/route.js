import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsRequestRoute extends Route {
  model() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.translationSubcase = this.modelFor('publications.publication.translations');

    return this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'translation-activity,email,used-pieces',
        sort: '-start-date',
      }
    );
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.translationSubcase = this.translationSubcase;
    controller.publicationFlow = this.publicationFlow;
  }
}
