import Component from '@glimmer/component';
import {
  action,
  set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';

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

  @action
  toggleOption(event) {
    set(this.options, event.target.name, !this.options[event.target.name]);
    // this.options[event.target.name] = !this.options[event.target.name];
    if (this.args.onChange) {
      this.args.onChange(this.options);
    }
  }
}
