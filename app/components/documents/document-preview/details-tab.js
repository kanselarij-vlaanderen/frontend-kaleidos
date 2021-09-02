import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDetailsDetailsTabComponent extends Component {
  @tracked isEditingDetails = false;
  @tracked editPieceMemory;

  @tracked documentType;
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @action
  async cancelEditDetails() {
    this.args.resetPiece(this.editPieceMemory);
    await this.loadDetailsData.perform();

    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @task
  *saveEditDetails() {
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();

    yield this.loadDetailsData.perform();
    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
    this.editPieceMemory = {
      name: this.args.piece.name,
      docType: this.documentType,
      accessLevel: this.accessLevel,
      confidentiality: this.args.piece.confidential,
    };
  }

  @action
  changeAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  changeDocumentType(docType) {
    this.documentType = docType;
  }
}
