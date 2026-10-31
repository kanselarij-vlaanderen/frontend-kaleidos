import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesSubmissionsDocumentUploadPanelComponent extends Component {
  @service store;
  @service conceptStore;
  @service toaster;
  @service intl;
  @service draftSubmissionService;

  validateFile = (file) => {
    return this.draftSubmissionService.validateUploadedFile(file);
  }

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);
    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      (this.args.confidential || parsed.confidential)
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

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
      accessLevel: defaultAccessLevel
    });
    this.args.onAddPiece(piece);
  }

  deletePiece = task(async (piece) => {
    await this.args.onDeletePiece(piece);
  });

  onDidUpdate = task(async () => {
    if (this.args.confidential && this.args.pieces.length) {
      // Strengthen the accessLevel of the draft-pieces to vertrouwelijk
      const confidentialAccessLevel = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
      );

      let changedAccessLevelOfPieces = false;
      const promises = this.args.pieces.map(async (piece) => {
        const accessLevel = await piece.accessLevel;
        if (accessLevel.uri != confidentialAccessLevel.uri) {
          // pieces are not persisted yet in the store at this point
          piece.accessLevel = confidentialAccessLevel;
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
