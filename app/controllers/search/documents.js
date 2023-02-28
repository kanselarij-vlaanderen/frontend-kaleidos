import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class SearchDocumentsController extends Controller {
  @service router;
  @service intl;
  @service conceptStore;

  queryParams = [
    {
      confidentialOnly: {
        type: 'boolean',
      },
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
      documentTypes: {
        type: 'array',
      },
    },
  ];

  sortOptions = [
    { value: '-created', label: this.intl.t('creation-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked confidentialOnly;
  @tracked searchText;
  @tracked documentTypes = [];
  @tracked documentTypesBuffer = [];

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = PAGINATION_SIZES[2];
    this.sort = this.sortOptions[1].value;
    this.confidentialOnly = false;
  }

  get emptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  navigateToDocument(document) {
    this.router.transitionTo('document', document.id);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  selectSort(event) {
    this.sort = event.target.value;
  }

  @action
  setDocumentTypes(documentTypes) {
    this.documentTypes = documentTypes.map((x) => x.id);
    this.documentTypesBuffer = documentTypes;
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }

  loadDocumentTypes = task(async () => {
    if (this.documentTypes) {
      this.documentTypesBuffer = (
        await Promise.all(
          this.documentTypes?.map((id) => this.store.findRecord('concept', id))
        )
      ).toArray();
    } else {
      this.documentTypesBuffer = [];
    }
  });

  getStringProp = (object, propName) => {
    if (object) {
      return object[propName];
    }
  }

}