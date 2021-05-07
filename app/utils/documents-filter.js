import { tracked } from '@glimmer/tracking';

// state of the documents filter
export default class DocumentsFilter {
  @tracked documentName;
  @tracked documentTypes;
  @tracked fileTypes;

  constructor(optionalInitialState) {
    const initialState = optionalInitialState || this._emptyState();
    Object.assign(this, initialState);
  }

  reset() {
    Object.assign(this, this._emptyState());
  }

  clone() {
    return new DocumentsFilter(this._toObject());
  }

  _emptyState() {
    return {
      documentName: '',
      documentTypes: [],
      fileTypes: [],
    };
  }

  _toObject() {
    return {
      documentName: this.documentName,
      documentTypes: this.documentTypes.slice(),
      fileTypes: this.fileTypes.slice(),
    };
  }
}
