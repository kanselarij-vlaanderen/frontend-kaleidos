import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
// import { task } from 'ember-concurrency-decorators';
import { A } from '@ember/array';

export default class PublicationDocumentsController extends Controller {
  @tracked isOpenPieceUploadModal = false;
  @tracked newPieces = A([]);
  isDisabled = true;

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
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
}
