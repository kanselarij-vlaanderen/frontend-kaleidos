import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TableDisplayConfigModalComponent extends Component {
  /**
   * @argument configElements: List of column objects with keyName (name) and translationKey (label) properties
   * @argument options: Object with column keyName (name) and current value mapping
   * @argument onChange: action used to handle a new options config
   * @argument onClose: action, fired when the 'X' is clicked
   */

  get optionColumns() {
    const columnSize = 10; // amount of options per column
    const columns = [];
    for (let i = 0; i < this.args.configElements.length; i += columnSize) { // eslint-disable-line id-length
      columns.push(this.args.configElements.slice(i, i + columnSize));
    }
    return columns;
  }

  @action
  toggleOption(optionName, event) {
    this.args.onChange(optionName, event.target.checked);
  }
}
