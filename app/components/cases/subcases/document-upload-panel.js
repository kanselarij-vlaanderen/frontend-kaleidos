import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import CONSTANTS from "frontend-kaleidos/config/constants";

export default class DocumentUploadPlanel extends Component {
  @service store;
  @service conceptStore;
  @service toaster;
  @service intl;

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

  onDidUpdate = task(async () => {
    if (this.args.confidential && this.args.pieces.length) {
      // Strengthen the accessLevel of the new pieces (not persisted yet) to vertrouwelijk
      let changedAccessLevelOfPieces = false;
      const confidential = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
      );
      const promises = this.args.pieces.map(async (piece) => {
        const accessLevel = await piece.accessLevel;
        if (
          ![
            CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
            CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
          ].includes(accessLevel.uri)
        ) {
          piece.accessLevel = confidential;
          changedAccessLevelOfPieces = true;
        }
      });
      await Promise.all(promises);
      if (changedAccessLevelOfPieces) {
        this.toaster.success(
          this.intl.t('uploaded-pieces-access-level-changed'),
        );
      }
    }
  });
}
