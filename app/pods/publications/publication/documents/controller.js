import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
// import { task } from 'ember-concurrency-decorators';
import { A } from '@ember/array';

export default class PublicationDocumentsController extends Controller {
  @tracked isOpenDocxUploadModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;


  @action
  openDocxUploadModal() {
    alert('Deze functionaliteit heeft nog geen implementatie');
    // this.isOpenDocxUploadModal = true;
  }

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  openTranslationRequestModal() {
    alert('Deze functionaliteit heeft nog geen implementatie');
    // this.isOpenTranslationRequestModal = true;
  }

  @action
  openPublishPreviewRequestModal() {
    alert('Deze functionaliteit heeft nog geen implementatie');
    // this.isOpenPublishPreviewRequestModal = true;
  }

  // TODO use this when actually uploading documents
  // @task
  // *cancelUploadPieces() {
  //   this.isOpenPieceUploadModal = false;
  // }

  @action
  cancelUploadPieces() {
    this.isOpenPieceUploadModal = false;
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
  }

  @action
  toggleFolderCollapse(piece) {
    piece.set('collapsed', !piece.collapsed);
  }
}
