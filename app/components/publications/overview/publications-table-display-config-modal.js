import Component from '@glimmer/component';
import {
  action,
  set
} from '@ember/object';
import configElements from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class OverviewTableDisplayConfigModalComponent extends Component {
  /**
   * @argument onChange: action used to handle a new options config
   * @argument onClose: action, fired when the 'X' is clicked
   */

  get optionColumns() {
    const columnSize = 10; // amount of options per column
    const columns = [];
    for (let i = 0; i < configElements.length; i += columnSize) { // eslint-disable-line id-length
      columns.push(configElements.slice(i, i + columnSize));
    }
    return columns;
  }

  @action
  toggleOption(optionName, event) {
    set(this.args.options, optionName, event.target.checked);
    if (this.args.onChange) {
      this.args.onChange(this.args.options);
    }
  }
}
