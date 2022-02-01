import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationTranslationsRequestRoute extends Route {
  @service store;
  @service currentPublicationFlow;

  async model() {
    this.translationSubcase = await this.currentPublicationFlow.publicationFlow.translationSubcase;

    return this.store.query('request-activity',
      {
        'filter[translation-subcase][:id:]': this.translationSubcase.id,
        include: 'translation-activity,translation-activity.generated-pieces,translation-activity.generated-pieces.file,email,used-pieces,used-pieces.file',
        sort: '-start-date',
      }
    );
  }

  async afterModel() {
    this.publicationSubcase = await this.currentPublicationFlow.publicationFlow.publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.translationSubcase = this.translationSubcase;
    controller.publicationSubcase = this.publicationSubcase;
  }
}
