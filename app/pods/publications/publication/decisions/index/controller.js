import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationDecisionsIndexController extends Controller {
  @service store;

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
  *saveReferenceDocument(document) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    yield documentContainer.save();

    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      name: document.name,
      confidential: false,
      pages: document.pageCount,
      file: document.file,
      documentContainer: documentContainer,
      publicationFlow: this.publicationFlow,
    });

    yield piece.save();

    this.send('refresh');
    this.closeReferenceDocumentUploadModal();
  }
}
