import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

export default class SearchResultsList extends Component {
  get isVisible() {
    if (isPresent(this.args.isVisible)) {
      return this.args.isVisible;
    }
    return true;
  }

  get positionClass() {
    if (isPresent(this.args.position)) {
      return `auk-search-results-list--${this.args.position}`;
    }
    return 'auk-search-results-list--left';
  }
}
