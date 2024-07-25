import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import CONSTANTS from "frontend-kaleidos/config/constants";

export default class DocumentUploadPlanel extends Component {
  @service store;
  @service conceptStore;

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);

    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    const accessLevels = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.ACCESS_LEVELS
    );
    const confidential = accessLevels.find(
      (concept) => concept.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
    );
    const internRegering = accessLevels.find(
      (concept) => concept.uri === CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: parsed.confidential ? confidential : internRegering,
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
