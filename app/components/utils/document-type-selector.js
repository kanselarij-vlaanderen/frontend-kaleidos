import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument {Concept} selectedDocumentType The document type to set the dropdown to
 * @argument {function} onChange Action to perform once a document type has been selected
 * @argument {boolean} disabled
 * @argument {boolean} renderInPlace
 */
export default class UtilsDocumentTypeSelectorComponent extends Component {
  @service store;
  @service conceptStore;

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
    this.options = yield this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES, {
      'filter[:has-no:narrower]': true,
      include: 'broader',
    });
  }

  @task
  *searchTask (searchValue) {
    yield timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    console.debug(searchValue);
    console.debug(this.options.filter((documentType) => documentType.label.includes(searchValue)));
    return this.options.filter((documentType) => documentType.label.includes(searchValue));
  }
}
