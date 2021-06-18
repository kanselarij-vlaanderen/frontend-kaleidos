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

    const allDocuments = new Set(); // using set to ensure a collection of unique documents

    const sourceDocuments = await this.translationSubcase.sourceDocuments;
    sourceDocuments.forEach((doc) => allDocuments.add(doc));

    const translationActivities = await this.translationSubcase.translationActivities;
    await Promise.all(
      translationActivities.map(async(activity) => {
        const translatedDocuments = await activity.generatedPieces;
        translatedDocuments.forEach((doc) => allDocuments.add(doc));
      })
    );

    return [...allDocuments];
  }

  async afterModel() {
    const publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = await publicationFlow.publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.translationSubcase = this.translationSubcase;
    controller.publicationSubcase = this.publicationSubcase;
    controller.selectedPieces = [];
  }

  @action
  refresh() {
    super.refresh();
  }
}
