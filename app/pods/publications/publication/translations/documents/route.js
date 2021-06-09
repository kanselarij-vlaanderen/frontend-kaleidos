import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsDocumentRoute extends Route {
  async model() {
    this.translationSubcase = this.modelFor('publications.publication.translations');

    // Workaround pagination by using include for the documents of a translation subcase
    // As such, we're sure all documents are loaded client-side by Ember Data
    this.store.findRecord('translation-subcase', this.translationSubcase.id, {
      include: [
        'source-documents',
        'translation-activities.generated-pieces'
      ].join(','),
    });

    const allDocuments = [];

    const sourceDocuments = await this.translationSubcase.sourceDocuments;
    allDocuments.push(...sourceDocuments.toArray());

    const translationActivities = await this.translationSubcase.translationActivities;
    await Promise.all(
      translationActivities.map(async(activity) => {
        const translatedDocuments = await activity.generatedPieces;
        allDocuments.push(...translatedDocuments.toArray());
      })
    );

    return allDocuments;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.translationSubcase = this.translationSubcase;
  }

  @action
  refresh() {
    super.refresh();
  }
}
