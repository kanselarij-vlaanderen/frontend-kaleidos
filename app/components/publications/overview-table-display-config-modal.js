import Component from '@glimmer/component';
import {
  action,
  set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import configElements from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class OverviewTableDisplayConfigModalComponent extends Component {
  /**
   * @argument options: a hash containing the display options as keys and booleans indicating
   * if the column needs to be displayed as values.
   * @argument onChange: action used to handle a new options config
   * @argument onClose: action, fired when the 'X' is clicked
   */
  @tracked options;

  constructor() {
    super(...arguments);
    this.options = this.args.options;
  }

  get optionColumns() {
    const columnSize = 10; // amount of options per column
    const columns = [];
    for (let i = 0; i < configElements.length; i += columnSize) { // eslint-disable-line id-length
      columns.push(configElements.slice(i, i + columnSize));
    }
    return columns;
  }

  @action
  toggleOption(event) {
    set(this.options, event.target.name, !this.options[event.target.name]);
    if (this.args.onChange) {
      this.args.onChange(this.options);
    }
  }
}
