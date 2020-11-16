import Component from '@glimmer/component';

export default class RadioList extends Component {
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
