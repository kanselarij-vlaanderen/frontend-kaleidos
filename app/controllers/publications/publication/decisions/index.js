import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, task } from 'ember-concurrency';

export default class PublicationsPublicationDecisionsIndexController extends Controller {
  @service store;
  @service publicationService;
  @service router;

  @tracked publicationFlow;
  @tracked isViaCouncilOfMinisters;
  @tracked isOpenReferenceDocumentUploadModal;

  @action
  openReferenceDocumentUploadModal() {
    this.isOpenReferenceDocumentUploadModal = true;
  }

  @action
  closeReferenceDocumentUploadModal() {
    this.isOpenReferenceDocumentUploadModal = false;
  }

  @task
  *saveReferenceDocuments(pieces) {
    pieces.forEach((piece) => piece.publicationFlow = this.publicationFlow);
    yield Promise.all(pieces.map((piece) => piece.save()));

    this.router.refresh('publications.publication.decisions.index');
    this.closeReferenceDocumentUploadModal();
  }

  @dropTask
  *deletePiece(piece) {
    yield this.publicationService.deletePiece(piece);
    this.router.refresh('publications.publication.decisions.index');
  }
}
