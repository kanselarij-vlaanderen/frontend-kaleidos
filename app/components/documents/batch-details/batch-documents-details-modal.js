import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { Row } from './document-details-row';
import { sortPieces } from 'frontend-kaleidos/utils/documents';


/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsDetailsModal extends Component {
  @service store;
  @service currentSession;
  @service fileService;

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

  get isEditingEnabled() {
    return this.currentSession.isEditor;
  }

  @task
  * initRows() {
    const documentsByContainer = new Map();
    for (const piece of this.args.pieces) {
      const container = yield piece.documentContainer;
      if (documentsByContainer.has(container)) {
        documentsByContainer.get(container)
          .push(piece);
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
      latestDocs.map(async(piece) => {
        const row = new Row();
        row.piece = piece;
        row.name = piece.name;
        row.accessLevel = piece.accessLevel;
        row.confidential = piece.confidential;

        row.documentContainer = await piece.documentContainer;

        row.documentType = row.documentContainer.type;

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
  * save() {
    const saves = this.rows.map(async(row) => {
      const piece = row.piece;
      if (row.isToBeDeleted) {
        this.fileService.deletePiece(piece)

        const piecesInContainer = await row.documentContainer.pieces;
        if (piecesInContainer.length === 1){
          this.fileService.deleteDocumentContainer(row.documentContainer);
        }
        //TODO delete from agenda item

      } else {
        piece.name = row.name;
        piece.confidential = row.confidential;
        // does not check for relationship changes
        let hasChanged = piece.dirtyType === 'updated';
        if (piece.documentType !== row.documentType) {
          hasChanged = true;
          piece.documentType = row.documentType;
        }
        if (piece.accessLevel !== row.accessLevel) {
          hasChanged = true;
          piece.accessLevel = row.accessLevel;
        }
        if (hasChanged) {
          await piece.save();
        }
      }
    });
    yield Promise.all(saves);
    this.args.onClose();
  }
}
