import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

class Row {
  piece;

  @tracked name;
  @tracked documentType;
  @tracked accessLevel;
  @tracked confidential;
  @tracked isToBeDeleted = false;
}

/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsModal extends Component {
  @service store;

  @tracked rows;
  @tracked selectedRows = [];
  @tracked documentTypes;
  @tracked accessLevels;

  constructor() {
    super(...arguments);

    this.initRows.perform();
    this.loadData.perform();
  }

  get isLoading() {
    return this.initRows.isRunning || this.loadData.isRunning;
  }

  get isSaveDisabled() {
    return this.isLoading || this.save.isRunning;
  }

  @task
  *initRows() {
    this.rows = yield Promise.all(this.args.pieces.map(async(piece) => {
      const row = new Row();
      row.piece = piece;

      row.name = piece.name;
      const docContainer = await piece.documentContainer;
      row.documentType = docContainer.type;
      row.accessLevel = piece.accessLevel;
      row.confidential = piece.confidential;
      return row;
    }));
  }

  @task
  *loadData() {
    yield Promise.all([
      this.loadDocumentTypes.perform().then((documentTypes) => this.documentTypes = documentTypes),
      this.loadAccessLevels.perform().then((accessLevels) => this.accessLevels = accessLevels)
    ]);
  }

  // TODO: delete
  @task
  *loadDocumentTypes() {
    return yield this.queryDocumentTypes.perform();
  }

  @task
  *loadAccessLevels() {
    return yield this.queryAccessLevels.perform();
  }

  @task
  *queryDocumentTypes(searchTerm) {
    const query = {
      page: {
        size: PAGE_SIZE.SELECT,
      },
      sort: 'priority',
    };
    if (searchTerm) {
      query['filter[label]'] = searchTerm;
    }

    return yield this.store.query('document-type', query);
  }

  @task
  *queryAccessLevels(searchTerm) {
    const query = {
      page: {
        size: PAGE_SIZE.SELECT,
      },
      sort: 'priority',
    };
    if (searchTerm) {
      query['filter[label]'] = searchTerm;
    }

    return yield this.store.query('access-level', query);
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

  get batchDocumentType() {
    return this.getBatchSelectedValue((row) => row.documentType);
  }

  get batchAccessLevel() {
    return this.getBatchSelectedValue((row) => row.accessLevel);
  }

  getBatchSelectedValue(getProperty) {
    if (this.selectedRows.length === 0) {
      return undefined;
    }
    const [firstRow, ...otherRows] = this.selectedRows;
    const firstProperty = getProperty(firstRow);
    const areRowsEqual = otherRows.every((row) => getProperty(row) === firstProperty);
    if (!areRowsEqual) {
      return undefined;
    }
    return firstProperty;
  }

  get batchConfidential() {
    if (this.selectedRows.length === 0) {
      return false;
    }
    return this.selectedRows.every((row) => row.confidential);
  }

  get batchIsToBeDeleted() {
    // some-check: always indicate dangerous action
    return this.selectedRows.some((row) => row.isToBeDeleted);
  }

  @task
  *searchDocumentTypes(searchTerm) {
    yield timeout(300);
    if (!searchTerm) {
      return this.documentTypes;
    }
    return yield this.queryDocumentTypes.perform(searchTerm);
  }

  @action
  setDocumentType(row, documentType) {
    row.documentType = documentType;
  }

  @task
  *searchAccessLevels(searchTerm) {
    yield timeout(300);
    if (!searchTerm) {
      return this.accessLevels;
    }
    return yield this.queryAccessLevels.perform(searchTerm);
  }

  @action
  setAccessLevel(rows, accessLevel) {
    // // allow call with row as parameter
    // if (!Array.isArray(rows)) {
    //   rows = [rows];
    // }

    for (const row of rows) {
      row.accessLevel = accessLevel;
    }
  }

  @action
  onInputConfidential(rows, event) {
    // // allow call with row as parameter
    // if (!Array.isArray(rows)) {
    //   rows = [rows];
    // }

    const checked = event.target.checked;
    console.log(checked);
    for (const row of rows) {
      row.confidential = checked;
    }
  }

  @action
  setToBeDeleted(rows, isToBeDeleted) {
    // // allow call with row as parameter
    // if (!Array.isArray(rows)) {
    //   rows = [rows];
    // }

    for (const row of rows) {
      row.isToBeDeleted = isToBeDeleted;
    }
  }

  @task
  *save() {
    const saves = this.rows.map(async(row) => {
      const piece = row.piece;
      if (row.isToBeDeleted) {
        piece.destroyRecord();
        piece.file.destroyRecord();
        // TODO: documentContainer destroy
        // and use fileService
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
  }
}
