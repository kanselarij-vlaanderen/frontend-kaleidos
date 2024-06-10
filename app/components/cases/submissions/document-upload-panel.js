import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';

export default class CasesSubmissionsDocumentUploadPanelComponent extends Component {
  @service store;

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;

    let type;
    const types = await this.store.queryAll('document-type', { filter: parsed.type });
    for (const maybeType of types.slice()) {
      if (maybeType.label === parsed.type) {
        type = maybeType;
        break;
      } else if (maybeType.altLabel === parsed.type) {
        type = maybeType;
        break;
      }
    }

    const now = new Date();
    const documentContainer = this.store.createRecord('draft-document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    const piece = this.store.createRecord('draft-piece', {
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
