import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import {
  getPieceDisplayName,
  getPieceDownloadUrl,
} from 'frontend-kaleidos/utils/documents';

export default class PublicationsDocumentsDocumentCardStepComponent extends Component {
  @tracked file;

  constructor() {
    super(...arguments);

    this.loadData();
  }

  @action
  async loadData() {
    this.file = await this.args.piece.file;
  }

  get name() {
    return getPieceDisplayName(this.args.piece, this.file);
  }

  get downloadUrl() {
    return getPieceDownloadUrl(this.args.piece, this.file);
  }

  @task
  *deletePiece() {
    yield this.args.onDelete();
  }
}
