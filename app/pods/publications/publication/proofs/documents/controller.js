import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {{
 *  key: string,
 *  isDescending: boolean
 * }} Sorting
 */

const PIECE_TYPES = {
  'source-documents': 0,
  'proofing-activities.generated-pieces': 1,
  'publication-activities.generated-pieces': 2,
};

class Row {
  @tracked isSelected = false;
  @tracked piece;
  @tracked type;

  constructor(piece, type) {
    this.piece = piece;
    this.type = type;
  }

  get isCorrected() {
    return this.type === 'proofing-activities.generated-pieces'
      || this.type === 'publication-activities.generated-pieces';
  }
}

const COLUMN_MAP = {
  ['ontvangen-op']: {
    property: (row) => row.piece.created,
  },
  ['geupload-op']: {
    property: (row) => row.piece.modified,
  },
};

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  @tracked rows;

  queryParams = [{
    qpSortingString: {
      as: 'volgorde',
    },
  }];

  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name, prepended with minus if descending */
  qpSortingString = '';
  /** @type {string} key name. prepended with minus if descending */
  @tracked sortingString = undefined;
  @tracked isRequestModalOpen = false;

  initRows(publicationSubcase) {
    const sourceDocRows = publicationSubcase.sourceDocuments.map((piece) => new Row(piece, 'source-documents'));
    const proofDocRows = publicationSubcase.proofingActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, 'proofing-activities.generated-pieces')));
    const pubDocRows = publicationSubcase.publicationActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, 'publication-activities.generated-pieces')));

    this.rows = flatten([sourceDocRows, proofDocRows, pubDocRows]);

    this.sortingString = this.qpSortingString;
    const sorting = Sorting.fromStringRestricted(this.sortingString, Object.keys(COLUMN_MAP));
    this.sort(sorting);
  }

  get canOpenRequestModal() {
    return this.rows.any((row) => row.isSelected);
  }

  @action
  openRequestModal(mode) {
    if (mode === 'new') {
      this.isRequestModalOpen = true;
    }
  }

  get areAllSelected() {
    return this.rows.every((row) => row.isSelected);
  }

  get selection() {
    return this.rows.filter((row) => row.isSelected).map((row) => row.piece);
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
    this.set('qpSorting', sortingString);
    const sorting = Sorting.fromString(sortingString);
    this.sort(sorting);
    this.rows.arrayContentDidChange();
  }

  sort(sorting) {
    if (sorting) {
      const compareFn = Sorting.createCompareFn(sorting, COLUMN_MAP);
      this.rows.sort(compareFn);
    } else {
      this.rows.sort((row1, row2) => {
        let comparison = PIECE_TYPES[row1.type] - PIECE_TYPES[row2.type];
        if (!comparison) {
          comparison = row1.piece.created - row2.piece.created;
        }
        return comparison;
      });
    }
  }

  @action
  openPieceUploadModal() {
    // TODO
  }
}

const Sorting = {
  fromStringRestricted(sortingString, restrictedKeys) {
    const sorting = this.fromString(sortingString);
    if (!sorting) {
      return undefined;
    }
    if (!restrictedKeys.includes(sorting.key)) {
      return undefined;
    }
    return sorting;
  },
  fromString(sortingString) {
    if (!sortingString) {
      return undefined;
    }
    const isDescending = sortingString.startsWith('-');
    const sortKey = sortingString.substr(isDescending);

    return {
      key: sortKey,
      isDescending: isDescending,
    };
  },
  toString(sorting) {
    if (sorting) {
      return (sorting.isDescending ? '-' : '') + sorting.key;
    }
    return '';
  },
  createCompareFn(sorting, propertyMap) {
    const getProperty = propertyMap[sorting.key].property;
    return (element1, element2) => {
      let comparison = getProperty(element1) - getProperty(element2);
      comparison = sorting.isDescending ? -comparison : comparison;
      return comparison;
    };
  },
};

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
