import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';

export default class PublicationTranslationDocumentRoute extends Route {
  @inject store;

  async model() {
    this.translationSubcase = await this.modelFor('publications.publication').translationSubcase;
    const sourceDocs = await this.translationSubcase.sourceDocuments;
    const generatedDocs = await this.translationSubcase.translationActivities.generatedPieces;
    const pieces = sourceDocs.toArray();
    pieces.push(generatedDocs.toArray());

    return pieces;
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
