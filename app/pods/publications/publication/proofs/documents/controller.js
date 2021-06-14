import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  @inject intl;

  @tracked pieces;

  queryParams = [{
    qpSorting: {
      // no intl: language not set yet.
      as: 'sorteer',
    },
  }]

  qpSorting = '';

  columnMap = {
    receiptDate: {
      translationKey: 'received-at',
      // ['translation'] added dynamically
      // TODO: correct properties!
      propertyPath: 'created',
    },
    uploadDate: {
      translationKey: 'uploaded-at',
      // TODO: correct properties!
      propertyPath: 'modified',
    },
  }

  constructor() {
    super(...arguments);

    for (const key in this.columnMap) {
      const column = this.columnMap[key];
      const translation = this.intl.t(column.translationKey);
      column.translation = translation.toLowerCase();
    }
  }

  toQPSorting(sorting) {
    const qpValue = this.columnMap[sorting].translation;
    this.set('qpSorting', qpValue);
  }

  fromQPSorting() {
    const qpValue = this.qpSorting;
    const isDesc = qpValue.startsWith('-');
    const translatedSortKey = qpValue.substr(isDesc);

    const sortField = Object.values(this.columnMap).find((column) => {
      const translation = column.translation;
      return translatedSortKey === translation;
    });

    return [isDesc, sortField];
  }

  @action
  changeSortOrder(sorting) {
    this.toQPSorting(sorting);
  }

  initSort() {
    this.model.sortBy('created');
    // this.sort();
  }

  sort(sortField) {
    this.model.sortBy(sortField.propertyPath);
  }

  @action
  openPieceUploadModal() {

  }
}
