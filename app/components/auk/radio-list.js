import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class RadioList extends Component {
  groupName = `radio-${guidFor(this)}`;
  /**
   * layout can be:
   * (empty, default = block)
   * inline
   */
  get layout() {
    if (this.args.layout) {
      return `auk-radio-list--${this.args.layout}`;
    }
    return '';
  }
}
