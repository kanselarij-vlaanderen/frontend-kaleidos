import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

class Row {
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

  @task
  *initRows() {
    this.rows = yield Promise.all(this.args.pieces.map(async(piece) => {
      const row = new Row();
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

  @task
  *searchDocumentTypes(searchTerm) {
    yield timeout(300);
    if (!searchTerm) {
      return this.loadDocumentTypes.lastValue;
    }
    return yield this.queryDocumentTypes.perform(searchTerm);
  }

  @task
  *searchAccessLevels(searchTerm) {
    yield timeout(300);
    if (!searchTerm) {
      return this.loadAccessLevels.lastValue;
    }
    return yield this.queryAccessLevels.perform(searchTerm);
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

  @action
  setDocumentType(row, documentType) {
    row.documentType = documentType;
  }

  @action
  setAccessLevel(row, documentType) {
    row.accessLevel = documentType;
  }
}
