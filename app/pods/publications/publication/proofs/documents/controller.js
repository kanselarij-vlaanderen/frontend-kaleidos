/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {{
 *  key: string,
 *  isDescending: boolean
 * }} Sorting
 */

const PIECE_RELATED_ENTITIES = {
  SOURCE_DOCUMENTS: 'source-documents',
  PROOFING_ACTIVITIES_GENERATED_PIECES: 'proofing-activities.generated-pieces',
  PUBLICATION_ACTIVITIES_GENERATED_PIECES: 'publication-activities.generated-pieces',
};

const COLUMN_MAP = {
  ['ontvangen-op']: {
    property: (row) => row.piece.created,
  },
  ['geupload-op']: {
    property: (row) => row.piece.modified,
  },
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
    this.#createRows(publicationSubcase);
    this.#initSort();
  }

  #createRows(publicationSubcase) {
    const sourceDocRows = publicationSubcase.sourceDocuments.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.SOURCE_DOCUMENTS));
    const proofDocRows = publicationSubcase.proofingActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.PROOFING_ACTIVITIES_GENERATED_PIECES)));
    const pubDocRows = publicationSubcase.publicationActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.PUBLICATION_ACTIVITIES_GENERATED_PIECES)));
    this.rows = flatten([sourceDocRows, proofDocRows, pubDocRows]);
  }

  #initSort() {
    this.sortingString = this.qpSortingString;
    let sorting = this.#sortingFromString(this.sortingString);
    console.log(sorting);
    if (sorting) {
      const restrictedKeys = Object.keys(COLUMN_MAP);
      const isValidSortKey = restrictedKeys.includes(sorting.key);
      if (!isValidSortKey) {
        this.set('qpSortingString', '');
        this.sortingString = '';
        sorting = undefined;
      }
    }

    console.log(sorting);
    this.#sort(sorting);
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
    this.set('qpSortingString', sortingString);
    const sorting = this.#sortingFromString(sortingString);
    this.#sort(sorting);
    this.rows.arrayContentDidChange();
  }

  #sortingFromString(sortingString) {
    if (!sortingString) {
      return undefined;
    }
    const isDescending = sortingString.startsWith('-');
    const sortKey = sortingString.substr(isDescending);

    return {
      key: sortKey,
      isDescending: isDescending,
    };
  }

  #sort(sorting) {
    let comparison = (row1, row2) => row1.piece.created - row2.piece.created;
    if (sorting) {
      const getProperty = COLUMN_MAP[sorting.key].property;
      comparison = (element1, element2) => {
        let comparison = getProperty(element1) - getProperty(element2);
        comparison = sorting.isDescending ? -comparison : comparison;
        return comparison;
      };
    }
    this.rows.sort(comparison);
  }

  @action
  openPieceUploadModal() {
    // TODO
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
