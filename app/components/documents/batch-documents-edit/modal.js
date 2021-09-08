import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { Row } from './row-piece';
import { AccessLevelsDataSource } from './access-level-selector';
import { DocumentTypesDataSource } from './document-type-selector';

/**
 * @argument {Piece[]} pieces includes: documentContainer,accessLevel
 */
export default class BatchDocumentsModal extends Component {
  @service store;

  @tracked rows;
  @tracked selectedRows = [];
  @tracked documentTypes;
  @tracked accessLevelSource;
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
    this.rows = yield Promise.all(
      this.args.pieces.map(async (piece) => {
        const row = new Row();
        row.piece = piece;

        row.name = piece.name;
        const docContainer = await piece.documentContainer;
        row.documentType = docContainer.type;
        row.accessLevel = piece.accessLevel;
        row.confidential = piece.confidential;
        return row;
      })
    );
  }

  @task
  *loadData() {
    yield Promise.all([
      AccessLevelsDataSource.create(this.store).then(
        (source) => (this.accessLevelSource = source)
      ),
      DocumentTypesDataSource.create(this.store).then(
        (source) => (this.documentTypes = source)
      ),
      // this.loadDocumentTypes.perform().then((documentTypes) => this.documentTypes = documentTypes),

      // this.loadAccessLevels.perform().then((accessLevels) => this.accessLevels = accessLevels)
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

  @task
  *searchDocumentTypes(searchTerm) {
    yield timeout(300);
    return yield this.queryDocumentTypes.perform(searchTerm);
  }

  @action
  setDocumentType(row, documentType) {
    row.documentType = documentType;
  }

  @task
  *searchAccessLevels(searchTerm) {
    yield timeout(300);
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
    const saves = this.rows.map(async (row) => {
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
