import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationDecisionsIndexController extends Controller {
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

  saveReferenceDocuments = task(async (pieces) => {
    pieces.forEach((piece) => piece.publicationFlow = this.publicationFlow);
    await Promise.all(pieces.map((piece) => piece.save()));

    this.router.refresh('publications.publication.decisions.index');
    this.closeReferenceDocumentUploadModal();
  });

  deletePiece = task({ drop: true }, async (piece) => {
    await this.publicationService.deletePiece(piece);
    this.router.refresh('publications.publication.decisions.index');
  });
}
