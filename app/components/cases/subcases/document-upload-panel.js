import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { capitalizeFirstLetter, findDocType } from 'frontend-kaleidos/utils/document-type';

export default class DocumentUploadPlanel extends Component {
  @service store;

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;

    const capitalizedType = capitalizeFirstLetter(parsed.type);
    const types = await this.store.queryAll('document-type', { filter: capitalizedType });
    const type = findDocType(capitalizedType, types);

    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      name: parsed.subject,
      documentContainer: documentContainer,
    });
    this.args.onAddPiece(piece);
  }

  @task
  *deletePiece(piece) {
    yield this.args.onDeletePiece(piece);
  }
}
