import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsRoute extends Route {
  async model() {
    this.translationSubcase = await this.modelFor('publications.publication.translations');

    let requestActivities = await this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'email,used-pieces,used-pieces.file',
        sort: '-start-date',
      }
    );

    let translationActivities = await this.store.query('translation-activity',
      {
        'filter[subcase][:id:]': this.translationSubcase.id,
        include: 'generated-pieces,generated-pieces.file',
        sort: '-start-date',
      }
    );

    let translationRows = await Promise.all([ requestActivities , translationActivities]);
    translationRows = translationRows.flatMap((row) => row.toArray())
    translationRows = translationRows.sortBy('startDate').reverseObjects();
    return translationRows;
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

  @action
  refresh() {
    super.refresh();
  }
}
