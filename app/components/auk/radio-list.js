import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

/**
 * radio-list component. Yields a radio-button component as "Radio", thereby taking care of the group "name".
 *
 * @argument{String} layout: Layout can be (empty, default = "block") or "inline"
 */
export default class RadioList extends Component {
  groupName = `radio-${guidFor(this)}`;

  get layout() {
    if (this.args.layout) {
      return `auk-radio-list--${this.args.layout}`;
    }
    return '';
  }
}
