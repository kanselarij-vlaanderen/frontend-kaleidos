import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDetailsDetailsTabComponent extends Component {
  @tracked isEditingDetails = false;
  @tracked editPieceMemory;

  @action
  async cancelEditDetails() {
    this.args.resetPiece(this.editPieceMemory);
    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @task
  *saveEditDetails() {
    yield this.args.piece.save();
    this.args.documentContainer.type = this.args.documentType;
    yield this.args.documentContainer.save();

    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
    this.editPieceMemory = {
      name: this.args.piece.name,
      docType: this.args.documentType,
      accessLevel: this.args.accessLevel,
      confidentiality: this.args.piece.confidential,
    };
  }

  @action
  changeDocumentType(docType) {
    this.args.changeDocumentType(docType);
  }
}
