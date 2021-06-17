import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {{
 *  key: string,
 *  isDescending: boolean
 * }} Sorting
 * @typedef {undefined|'sortKey'|'-sortKey'} SortingString
 */

const COLUMN_MAP = {
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
};

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  @inject router;

  queryParams = [{
    qpSorting: {
      as: 'volgorde',
    },
  }]

  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  qpSorting = '';

  /**
   * @type {SortingString}
   */
  @tracked sortingString = undefined;

  get routeName() {
    return this.router.currentRouteName;
  }

  initSort() {
    const sorting = this.getQPSorting();
    this.sortingString = this.sortingToString(sorting);
    this.sort(sorting);
  }

  @action
  changeSorting(sortingString) {
    this.sortingString = sortingString;
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
    for (const sortKey in COLUMN_MAP) {
      const column = COLUMN_MAP[sortKey];
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
    let translatedSorting = undefined;
    if (sorting) {
      console.log(sorting);
      const column = COLUMN_MAP[sorting.key];
      const translatedKey = column.qpKey;
      translatedSorting = {
        key: translatedKey,
        isDescending: sorting.isDescending,
      };
    }
    const sortingString = this.sortingToString(translatedSorting);
    this.set('qpSorting', sortingString);
  }

  sortingFromString(sortingString) {
    if (sortingString) {
      const isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      return {
        key: sortKey,
        isDescending: isDescending,
      };
    }
    return undefined;
  }

  sortingToString(sorting) {
    if (sorting) {
      return (sorting.isDescending ? '-' : '') + sorting.key;
    }
    return '';
  }

  sort(sorting) {
    if (sorting) {
      // const sortingString = this.toSortingString(sorting);
      this.model.sort((piece1, piece2) => {
        const property = COLUMN_MAP[sorting.key].property;
        let comparison = property(piece1) - property(piece2);
        comparison = sorting.isDescending ? -comparison : comparison;
        return comparison;
      });
      // array sort changes are not observed by Ember
    } else {
      // TODO: default sort
    }
    this.model.arrayContentDidChange();
  }


  @action
  openPieceUploadModal() {

  }
}
