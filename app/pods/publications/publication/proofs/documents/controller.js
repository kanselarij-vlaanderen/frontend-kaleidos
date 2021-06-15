import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {{
 *  key: string,
 *  isDescending: boolean
 * }} Sorting
 */
export default class PublicationsPublicationProofsDocumentsController extends Controller {
  @inject intl;

  @tracked pieces;

  queryParams = [{
    qpSorting: {
      as: 'sorteer',
    },
  }]

  qpSorting = '';
  // undefined|'sortKey'|'-sortKey'
  @tracked sortingString = undefined;

  columnMap = {
    receiptDate: {
      key: 'receiptDate',
      qpKey: 'ontvangen-op',
      // TODO: correct properties!
      property: (piece) => piece.created,
    },
    uploadDate: {
      key: 'uploadDate',
      qpKey: 'geupload-op',
      // TODO: correct properties!
      property: (piece) => piece.modified,
    },
  }

  initSort() {
    // for (const key in this.columnMap) {
    //   const column = this.columnMap[key];
    //   column.key = key;
    //   column.qpSortingKey = this.translateQPSortingKey(column.translationKey);
    // }

    const sorting = this.getQPSorting();
    this.sortingString = this.sortingToString(sorting);
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
      return undefined;
    }

    const {
      key: translatedSortKey, isDescending,
    } = this.sortingFromString(value);

    let foundSortKey;
    for (const sortKey in this.columnMap) {
      const column = this.columnMap[sortKey];
      const translatedSortKey2 = column.qpKey;
      if (translatedSortKey === translatedSortKey2) {
        foundSortKey = sortKey;
        break;
      }
    }

    // unknown column
    if (!foundSortKey) {
      return undefined;
    }

    return {
      key: foundSortKey,
      isDescending: isDescending,
    };
  }

  setQPSorting(sorting) {
    const column = this.columnMap[sorting.key];
    const translatedKey = column.qpKey;
    const sortingString = this.sortingToString({
      key: translatedKey,
      isDescending: sorting.isDescending,
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
