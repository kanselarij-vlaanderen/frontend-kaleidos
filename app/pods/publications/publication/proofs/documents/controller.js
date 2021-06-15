import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { dasherize } from '@ember/string';
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
      // ['qpSortingKey'] added dynamically
      // TODO: correct properties!
      property: (piece) => piece.created,
    },
    uploadDate: {
      translationKey: 'uploaded-at',
      // TODO: correct properties!
      property: (piece) => piece.modified,
    },
  }

  translateQPSortingKey(translationKey) {
    let value = this.intl.t(translationKey);
    console.log(value);
    value = value.toLowerCase();
    value = dasherize(value);
    return value;
  }

  sortingToQP(sorting) {
    const sortingString = this.sortingToString(sorting);
    this.set('qpSorting', sortingString);
  }

  sortingFromQP() {
    const value = this.qpSorting;

    if (value) {
      const isDescending = value.startsWith('-');
      const translatedSortKey = value.substr(isDescending);

      const column = Object.values(this.columnMap).find((column) => {
        const sortingKey = this.translateQPSortingKey(column.translationKey);
        return translatedSortKey === sortingKey;
      });

      return {
        column: column,
        isDescending: isDescending,
      };
    }
  }

  initSort() {
    // for (const key in this.columnMap) {
    //   const column = this.columnMap[key];
    //   column.key = key;
    //   column.qpSortingKey = this.translateQPSortingKey(column.translationKey);
    // }

    const sorting = this.sortingFromQP();
    this.sort(sorting);
  }

  @action
  changeSorting(sortingString) {
    this.sortingToQP(sortingString);
  }

  sortingToString(sorting) {
    return (sorting.isDescending ? '-' : '') + sorting.column.property;
  }

  sortingFromString(sortingString) {
    const isDescending = sortingString.startsWith('-');
    const sortKey = sortingString.substr(isDescending);
    const column = this.columnMap[sortKey];
    return {
      column: column,
      isDescending: isDescending,
    };
  }

  sort(sorting) {
    if (sorting) {
      // const sortingString = this.toSortingString(sorting);
      this.model.sort((piece1, piece2) => {
        let comparison = sorting.column.property(piece1) - sorting.column.property(piece2);
        comparison = sorting.isDescending ? -comparison : comparison;
        return comparison;
      });
    } else {
      // TODO: default sort
    }
  }

  @action
  openPieceUploadModal() {

  }
}
