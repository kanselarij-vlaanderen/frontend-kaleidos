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
      key: 'receiptDate',
      translationKey: 'received-at',
      // TODO: correct properties!
      property: (piece) => piece.created,
    },
    uploadDate: {
      key: 'uploadDate',
      translationKey: 'uploaded-at',
      // TODO: correct properties!
      property: (piece) => piece.modified,
    },
  }

  translateQPSortingKey(column) {
    let value = this.intl.t(column.translationKey);
    value = value.toLowerCase();
    value = dasherize(value);
    return value;
  }

  initSort() {
    // for (const key in this.columnMap) {
    //   const column = this.columnMap[key];
    //   column.key = key;
    //   column.qpSortingKey = this.translateQPSortingKey(column.translationKey);
    // }

    const sorting = this.getQPSorting();
    this.sort(sorting);
  }

  @action
  changeSorting(sortingString) {
    const sorting = this.sortingFromString(sortingString);
    this.setQPSorting(sorting);
    this.sort(sorting);
  }

  getQPSorting() {
    const value = this.qpSorting;

    if (!value) {
      return;
    }

    const {
      key: translatedSortKey, isDescending,
    } = this.sortingFromString(value);

    let foundSortKey;
    for (const sortKey in this.columnMap) {
      const column = this.columnMap[sortKey];
      const translatedSortKey2 = this.translateQPSortingKey(column);
      if (translatedSortKey === translatedSortKey2) {
        foundSortKey = sortKey;
        break;
      }
    }

    // unknown column
    if (!foundSortKey) {
      return;
    }

    return {
      key: foundSortKey,
      isDescending: isDescending,
    };
  }

  setQPSorting(sorting) {
    const column = this.columnMap[sorting.key];
    const translatedKey = this.translateQPSortingKey(column);
    const sortingString = this.sortingToString({
      key: translatedKey, isDescending: sorting.isDescending,
    });
    this.set('qpSorting', sortingString);
  }

  sortingFromString(sortingString) {
    const isDescending = sortingString.startsWith('-');
    const sortKey = sortingString.substr(isDescending);
    return {
      key: sortKey,
      isDescending: isDescending,
    };
  }

  sortingToString(sorting) {
    return (sorting.isDescending ? '-' : '') + sorting.key;
  }

  sort(sorting) {
    if (sorting) {
      // const sortingString = this.toSortingString(sorting);
      this.model.sort((piece1, piece2) => {
        const property = this.columnMap[sorting.key].property;
        let comparison = property(piece1) - property(piece2);
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
