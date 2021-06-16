import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

export default class SearchResultsList extends Component {
  get isActive() {
    if (isPresent(this.args.isActive)) {
      return this.args.isActive;
    }
    return true;
  }
}
