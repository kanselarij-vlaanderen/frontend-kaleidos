import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE, LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument {Concept} selectedDocumentType The document type to set the dropdown to
 * @argument {function} onChange Action to perform once a document type has been selected
 * @argument {boolean} disabled
 * @argument {boolean} renderInPlace
 */
export default class UtilsDocumentTypeSelectorComponent extends Component {
  @service store;

  @tracked options;

  constructor() {
    super(...arguments);

    this.loadDocumentTypes.perform();
  }

  get isLoading() {
    return this.args.isLoading || this.loadDocumentTypes.isRunning;
  }

  @task
  *loadDocumentTypes() {
    this.options = yield this.store.query('concept', {
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES,
        },
        ':has-no:narrower': true,
      },
      include: 'broader,narrower',
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
  }

  @task
  *searchTask (searchValue) {
    yield timeout(LIVE_SEARCH_DEBOUNCE_TIME);

    return yield this.store.query('concept', {
      filter: {
        label: searchValue,
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES,
        },
        ':has-no:narrower': true,
      },
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
  }
}
