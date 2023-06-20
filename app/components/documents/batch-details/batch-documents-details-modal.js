import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Row } from './document-details-row';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task, all } from 'ember-concurrency';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsDetailsModal extends Component {
  @service pieceAccessLevelService;
  @service signatureService;

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
        row.hasSignFlow = await this.signatureService.hasSignFlow(piece);
        return row;
      })
    );
  }

  get areAllSelected() {
    const selectableRows = [];
    this.rows.forEach(row => {
      if(!row.hasSignFlow) {
        selectableRows.pushObject(row);
      }
    })
    return selectableRows.length === this.selectedRows.length;
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
      this.rows.forEach(row => {
        if(!row.hasSignFlow) {
          this.selectedRows.pushObject(row)
        }
      });
    }
  }

  @task
  *save() {
    yield all(this.rows.map(async (row) => {
      const piece = row.piece;
      const documentContainer = row.documentContainer;
      if (row.isToBeDeleted) {
        const previousPiece = await piece.previousPiece;
        await deletePiece(piece);
        if (this.args.didDeletePiece && previousPiece) {
          await this.args.didDeletePiece(previousPiece);
        }
        // container is cleaned up in deletePiece if no more pieces exist
      } else {
        piece.name = row.name;
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
