import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  restartableTask,
  lastValue
} from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import { MAX_PAGE_SIZES } from 'frontend-kaleidos/config/config';

/**
 * @argument {PublicationFlow} selected
 * @argument {Case} case
 * @argument {(publicationFlow: { id: string, identification: string }) => void} onChange
 */
export default class PublicationsPublicationFlowSelectorComponent extends Component {
  @service store;

  @lastValue('search') options = [];

  // ember-power-select clears the search input,
  // but not the search result list on close.
  // Therefore we reinitialize the options on open.
  @action
  onOpen() {
    this.search.perform();
  }

  // ember-power-select doesn't perform the search task
  // when the search input is empty. Handle this case using onInput.
  @action
  onInput(searchText) {
    if (isBlank(searchText)) {
      this.search.perform();
    }
    // else: regular search task will be called
  }

  @restartableTask
  *debouncedSearch(searchText) {
    yield timeout(300);
    this.search.perform(searchText);
  }

  @restartableTask
  *search(searchText) {
    const filter = {
      // multiple reference documents on 1 publication-flow must belong to the same case
      case: {
        ':id:': this.args.case.get('id'),
      },
    };
    if (!isBlank(searchText)) {
      filter.identification = {
        'id-name': searchText,
      };
    }
    const publicationFlows = yield this.store.query('publication-flow', {
      filter,
      'page[size]': MAX_PAGE_SIZES.PUBLICATION_FLOWS,
      sort: 'identification.id-name',
      include: 'identification',
    });
    return publicationFlows;
  }
}
