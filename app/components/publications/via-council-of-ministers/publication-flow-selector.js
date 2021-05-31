import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

/**
 * @argument {Identification} selected
 * @argument {(identification: Identification) => void} onChange
 */
export default class PublicationsViaCouncilOfMinistersPublicationFlowSelectorComponent extends Component {
  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  // select correct element in the list
  // EmberPowerSelect does not select the correct element in the drop down
  get selected() {
    // .get('id'): Ember complains about .id syntax
    const id = this.args.selected.get('id');
    return this.options.findBy('id', id) || this.args.selected;
  }

  // onOpen event:
  //  searchText is cleared when the select has been closed.
  //  this does not trigger an onInput or search event
  @action
  onOpen(select) {
    if (!select.searchText) {
      this.loadData.perform();
    }
  }

  @action
  // onInput event: search event does not fire when input is cleared
  // when used for a non-empty searchText, the input is cleared
  //  so we need both events.
  onInput(searchText) {
    if (!searchText) {
      this.loadData.perform();
      // prevent default filtering
      // return false;
    }
  }

  @action
  search(searchText) {
    this.loadData.perform(searchText);
  }

  @keepLatestTask
  *loadData(searchText) {
    this.options = yield this.args.loadData(searchText);
  }

  @action
  onChange(selected) {
    this.args.onChange(selected);
  }
}
