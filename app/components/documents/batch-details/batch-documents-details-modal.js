import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Row } from './document-details-row';
import { sortPieceVersions } from 'frontend-kaleidos/utils/documents';
import { task, all } from 'ember-concurrency';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import { isPresent} from '@ember/utils';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsDetailsModal extends Component {
  @service pieceAccessLevelService;
  @service signatureService;
  @service currentSession;
  @service documentService;

  @tracked rows;
  @tracked reorderableRows;
  @tracked selectedRows = [];

  constructor() {
    super(...arguments);
    this.initRows.perform();
  }

  get agendaitemIsRetracted() {
    return this.args.decisionActivity?.get('isRetracted');
  }

  get isLoading() {
    return this.initRows.isRunning;
  }

  get isSaveDisabled() {
    return this.isLoading || this.save.isRunning;
  }

  get hasDraftPieces() {
    return this.args.pieces.any(
      (piece) => !piece.constructor.relationshipNames.belongsTo.includes('signMarkingActivity')
    );
  }

  get isSignaturesEnabled() {
    const hasPermission = this.currentSession.may('manage-signatures');
    return hasPermission && !this.hasDraftPieces;
  }

  get isAccessLevelEnabled() {
    // TODO not fully sure why we shouldn't show the access level? I would want to make sure my confidential file is marked as such..
    // or edit mistakes, maybe don't allow cabinet to edit 'intern-secretarie'
    // it is visible just fine in documents route either way
    return !this.hasDraftPieces;
  }

  get isEditingEnabled() {
    return this.args.allowEditing || this.currentSession.may('manage-documents');
  }

  @task
  *initRows() {
    const documentsByContainer = new Map();
    for (const piece of this.args.pieces) {
      const container = yield piece.documentContainer;
      if (documentsByContainer.has(container)) {
        documentsByContainer.get(container).push(piece);
      } else {
        documentsByContainer.set(container, [piece]);
      }
    }

    for (const key of documentsByContainer.keys()) {
      const documents = documentsByContainer.get(key);
      const sortedDocuments = sortPieceVersions(documents);
      documentsByContainer.set(key, sortedDocuments);
    }

    const latestDocs = [];
    for (const docs of documentsByContainer.values()) {
      latestDocs.push(docs[0]);
    }

    this.rows = yield Promise.all(
      latestDocs.map(async (piece) => {
        const row = new Row();
        row.piece = piece;
        row.name = piece.name;
        row.accessLevel = piece.accessLevel;
        row.documentContainer = await piece.documentContainer;
        row.documentType = row.documentContainer.type;
        if (this.isSignaturesEnabled) {
          row.signMarkingActivity = await piece.signMarkingActivity;
          row.signedPiece = await piece.signedPiece;
          row.showSignature = isPresent(this.args.decisionActivity);
          row.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(piece);
          row.hasSentSignFlow = row.signMarkingActivity && !row.hasMarkedSignFlow;
          row.markedForSignature = row.signMarkingActivity && row.hasMarkedSignFlow;
        }
        return row;
      })
    );
    this.reorderableRows = this.rows.slice();
  }

  get areAllSelected() {
    return this.rows.length === this.selectedRows.length;
  }

  @action
  toggleSelection(row) {
    const isSelected = this.selectedRows.includes(row);
    if (isSelected) {
      removeObject(this.selectedRows, row);
    } else {
      this.selectedRows.push(row);
    }
    // array content changes are not tracked
    this.selectedRows = [...this.selectedRows];
  }

  @action
  toggleAllSelection() {
    if (this.areAllSelected) {
      this.selectedRows = [];
    } else {
      this.selectedRows = [...this.rows];
    }
  }

  @task
  *save() {
    const changedPieces = [];
    yield all(this.reorderableRows.map(async (row, index) => {
      const piece = row.piece;
      const documentContainer = row.documentContainer;
      if (row.isToBeDeleted) {
        if (row.hasMarkedSignFlow) {
          const signSubcase = await row.signMarkingActivity?.signSubcase;
          const signFlow = await signSubcase?.signFlow;
          await this.signatureService.removeSignFlow(signFlow);
        }
        const previousPiece = await piece.previousPiece;
        await deletePiece(piece);
        if (this.args.didDeletePiece && previousPiece) {
          await this.args.didDeletePiece(previousPiece);
        }
        // container is cleaned up in deletePiece if no more pieces exist
      } else {
        piece.name = row.name?.trim();
        // does not check for relationship changes
        let accessLevelHasChanged = false;
        let hasChanged = piece.dirtyType === 'updated';
        if (documentContainer.type !== row.documentType) {
          hasChanged = true;
          documentContainer.type = row.documentType;
        }
        if (documentContainer.position !== index + 1) {
          hasChanged = true;
          documentContainer.position = index + 1;
        }
        if (piece.accessLevel !== row.accessLevel) {
          hasChanged = true;
          accessLevelHasChanged = true;
          piece.accessLevel = row.accessLevel;
        }
        if (row.markedForSignature && !row.hasMarkedSignFlow) {
          await this.signatureService.markDocumentForSignature(piece, this.args.decisionActivity);
        }
        if (!row.markedForSignature && row.hasMarkedSignFlow) {
          const signSubcase = await row.signMarkingActivity?.signSubcase;
          const signFlow = await signSubcase?.signFlow;
          await this.signatureService.removeSignFlow(signFlow);
        }
        if (hasChanged) {
          await piece.save();
          await documentContainer.save();
          if (accessLevelHasChanged) {
            await this.pieceAccessLevelService.updatePreviousAccessLevels(piece);
          }
          changedPieces.push(piece);
        }
      }
    }));
    yield this.documentService.checkAndRestamp(changedPieces);
    this.args.onSave();
  }

  @action
  onReorderPieces(rows, _movedRow) {
    this.reorderableRows = rows;
  }
}
