import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';

export default class PublicationsPublicationTranslationsDocumentRoute extends Route {
  @inject store;

  async model() {
    this.translationSubcase = await this.modelFor('publications.publication').translationSubcase;
    const sourceDocs = await this.translationSubcase.sourceDocuments;
    const generatedDocs = await this.translationSubcase.translationActivities.generatedPieces;
    const pieces = [];
    if (sourceDocs) {
      for (const piece of sourceDocs.toArray()) {
        pieces.push(piece);
      }
    }
    if (generatedDocs) {
      for (const piece of generatedDocs.toArray()) {
        pieces.push(piece);
      }
    }

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
