import Component from '@glimmer/component';

/**
 *
 * @argument {String} key
 * @argument {String} value
 * @argument {String} layout: possible value: 'horizontal'
 * @argument {String} icon: icon to show left of the label
 */
export default class KeyValue extends Component {
  get layout() {
    if (this.args.layout) {
      return `auk-key-value-item--${this.args.layout}`;
    }
    return null;
  }
}
