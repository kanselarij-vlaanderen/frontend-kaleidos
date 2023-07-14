import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Row } from './document-details-row';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task, all } from 'ember-concurrency';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsDetailsModal extends Component {
  @service pieceAccessLevelService;
  @service signatureService;
  @service currentSession;

  @tracked rows;
  @tracked selectedRows = [];

  constructor() {
    super(...arguments);
    this.initRows.perform();
  }

  get isLoading() {
    return this.initRows.isRunning;
  }

  get isSaveDisabled() {
    return this.isLoading || this.save.isRunning;
  }

  get isSignaturesEnabled() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
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
      const sortedDocuments = sortPieces(documents);
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
          row.showSignature = isPresent(this.args.decisionActivity);
          row.hasSignFlow = await this.signatureService.hasSignFlow(piece);
          row.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(piece);
          row.markedForSignature = row.signMarkingActivity && row.hasMarkedSignFlow;
        }
        return row;
      })
    );
  }

  get areAllSelected() {
    return this.rows.length === this.selectedRows.length;
  }

  @action
  toggleSelection(row) {
    const isSelected = this.selectedRows.includes(row);
    if (isSelected) {
      this.selectedRows.removeObject(row);
    } else {
      this.selectedRows.pushObject(row);
    }
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
    yield all(this.rows.map(async (row) => {
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
        }
      }
    }));
    this.args.onSave();
  }
}
