import Component from '@glimmer/component';

export default class ThSortable extends Component {
  get field() {
    return this.args.field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  get nextSort() {
    if (this.ascendingOrder) {
      return `-${this.field}`;
    } else if (this.descendingOrder) {
      return '';
    }  // if currentSorting is not set to this field
    return this.field;
  }

  get isAscendingOrder() {
    return this.args.currentSorting === this.field;
  }

  get isDescendingOrder() {
    return this.args.currentSorting === `-${this.field}`;
  }
}
