import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument filterTitle
 * @argument onSetFilter
 * @argument defaultFilter: filter's initial value
 */
export default class TextFilter extends Component {
  @service router;
  @service store;

  @tracked filterText;
  @tracked isOpenAddSubmissionModal = false;

  constructor() {
    super(...arguments);
    this.filterText = this.args.defaultFilter || '';
  }

  get enableFilter() {
    return typeof this.args.onSetFilter === "function";
  }

  @action
  onInputFilter(event) {
    this.filterText = event.target.value;
    this.debouncedSetFilter.perform();
  }

  debouncedSetFilter = task({ restartable: true }, async () => {
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    this.args.onSetFilter(this.filterText);
  });

  clearFilter = () => {
    this.filterText = '';
    this.args.onSetFilter(this.filterText);
  }
}
