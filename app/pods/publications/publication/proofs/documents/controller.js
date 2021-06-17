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

class Row {
  @tracked isSelected = false;
  @tracked piece;
  @tracked type;

  constructor(piece, type) {
    this.piece = piece;
    this.type = type;
  }
}

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
  @tracked rows;

  queryParams = [{
    qpSorting: {
      as: 'volgorde',
    },
  }]

  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name prepended with minus if descending */
  qpSorting = '';
  /** @type {string} key name prepended with minus if descending */
  @tracked sortingString = undefined;

  get routeName() {
    return this.router.currentRouteName;
  }

  initRows(pubSubcase) {
    const sourceDocRows = pubSubcase.sourceDocuments.map((piece) => new Row(piece, 'source'));
    const proofDocRows = pubSubcase.proofingActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, 'proofing')));
    const pubDocRows = pubSubcase.publicationActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, 'publication')));

    this.rows = flatten([sourceDocRows, proofDocRows, pubDocRows]);

    const sorting = this.getQPSorting();
    this.sortingString = this.sortingToString(sorting);
    this.sort(sorting);
  }

  get canCreateNewRequest() {
    return this.rows.any((row) => row.isSelected);
  }

  get areAllSelected() {
    return this.rows.every((row) => row.isSelected);
  }

  @action
  toggleSelectionAll() {
    const newValue = !this.areAllSelected;
    for (const row of this.rows) {
      row.isSelected = newValue;
    }
  }

  @action
  toggleSelection(row) {
    row.isSelected = !row.isSelected;
  }

  @action
  changeSorting(sortingString) {
    this.sortingString = sortingString;
    const sorting = this.sortingFromString(sortingString);
    this.setQPSorting(sorting);
    this.sort(sorting);
    this.rows.arrayContentDidChange();
  }

  getQPSorting() {
    const currentSortingQP = this.qpSorting;

    if (!currentSortingQP) {
      return undefined;
    }

    const {
      key: currentQPValue, isDescending,
    } = this.sortingFromString(currentSortingQP);

    let foundSortKey;
    for (const sortKey in COLUMN_MAP) {
      const column = COLUMN_MAP[sortKey];
      const qpValue = column.qpKey;
      if (currentQPValue === qpValue) {
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
      this.rows.sort((row1, row2) => {
        const property = COLUMN_MAP[sorting.key].property;
        let comparison = property(row1.piece) - property(row2.piece);
        comparison = sorting.isDescending ? -comparison : comparison;
        return comparison;
      });
      // array sort changes are not observed by Ember
    } else {
      // TODO: default sort
    }
  }


  @action
  openPieceUploadModal() {

  }
}

function flatten(arrayOfArrays, flatArray = []) {
  for (const arrayOrValue of arrayOfArrays) {
    if (Array.isArray(arrayOrValue)) {
      flatten(arrayOrValue, flatArray);
    } else {
      flatArray.push(arrayOrValue);
    }
  }
  return flatArray;
}
