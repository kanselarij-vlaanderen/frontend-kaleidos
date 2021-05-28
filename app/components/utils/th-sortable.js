import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ThSortable extends Component {
  get isAscendingOrder() {
    return this.args.currentSorting === this.args.field;
  }

  get isDescendingOrder() {
    return this.args.currentSorting === `-${this.args.field}`;
  }
  }

  @action
  changeSort() {
    let nextSort;
    if (this.isAscendingOrder) { // from ascending to descending
      nextSort = `-${this.args.field}`;
    } else if (this.isDescendingOrder) { // from descending to no-sort
      nextSort = '';
    } else { // from no-sort to ascending
      nextSort = this.args.field;
    }
    this.args.onChange(nextSort);
  }
}
