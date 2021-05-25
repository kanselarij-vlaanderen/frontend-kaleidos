import Component from '@glimmer/component';

export default class ThSortable extends Component {
  get field() {
    return this.args.field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  get isSorted() {
    return this.args.currentSorting === this.field
      || this.args.currentSorting === `-${this.field}`;
  }
}
