import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ThSortable extends Component {
  get field() {
    return this.args.field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  get isAscendingOrder() {
    return this.args.currentSorting === this.field;
  }

  get isDescendingOrder() {
    return this.args.currentSorting === `-${this.field}`;
  }

  @action
  changeSort() {
    let nextSort;
    if (this.isAscendingOrder) { // from ascending to descending
      nextSort = `-${this.field}`;
    } else if (this.isDescendingOrder) { // from descending to no-sort
      nextSort = '';
    } else { // from no-sort to ascending
      nextSort = this.field;
    }
    this.args.onChange(nextSort);
  }
}
