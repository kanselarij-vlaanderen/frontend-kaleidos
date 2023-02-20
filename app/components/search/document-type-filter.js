import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DocumentTypeFilter extends Component {
  @service conceptStore;

  @tracked _selected = null;
  @tracked showAllTypes = false;

  defaultVisibleTypes = [...Object.values(CONSTANTS.DOCUMENT_TYPES)];

  constructor() {
    super(...arguments);

    this.loadDocumentTypes.perform();
  }

  get selected() {
    return this._selected ?? this.args.selected ?? [];
  }

  set selected(selected) {
    this._selected = selected;
    this.args.onChange?.(this.selected);
  }

  get someDocumentTypesSelected() {
    return this.selected.length > 0;
  }

  get allDocumentTypesSelected() {
    return this.selected.length === this.documentTypes.length;
  }

  @action
  toggleAllDocumentTypes() {
    if (!this.allDocumentTypesSelected) {
      this.selected = [...this.documentTypes];
    } else {
      this.selected = [];
    }
  }

  _toggleDocumentType = (documentType) => {
    const index = this.selected.indexOf(documentType);
    if (index >= 0) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(documentType);
    }
  };

  @action
  toggleDocumentType(documentType) {
    this._toggleDocumentType(documentType);
    this.selected = [...this.selected];
  }

  @action
  enableAllTypes() {
    this.selected = this.documentTypes;
  }

  @action
  disableAllTypes() {
    this.selected = [];
  }

  loadDocumentTypes = task(async () => {
    this.documentTypes = (
      await this.conceptStore.queryAllByConceptScheme(
        CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES
      )
    ).content;
  });
}
