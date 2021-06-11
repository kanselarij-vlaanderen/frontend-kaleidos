import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';

/**
 * component to make PowerSelect more DDAU:
 * @search is always called when search text changes,
 *  allowing the options to be filtered in the parent component.
 */
export default class UtilsPowerSelectDDAUComponent extends Component {
  // ember-power-select clears the search input,
  // but not the search result list on close.
  // Therefore we reinitialize the options on open.
  @action
  onOpen() {
    this.args.search('');
  }

  // ember-power-select doesn't perform the search task
  // when the search input is empty. Handle this case using onInput.
  @action
  onInput(searchText) {
    if (isBlank(searchText)) {
      this.args.search('');
    }
    // else: regular search task will be called
  }

  @action
  search(searchText) {
    this.args.search(searchText);
  }
}
