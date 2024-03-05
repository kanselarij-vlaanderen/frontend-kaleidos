import Component from '@glimmer/component';

export default class TableComponent extends Component {
  shouldDisableRow = (row) => {
    return this.args.shouldDisableRow?.(row);
  }
}