import Component from '@glimmer/component';

export default class CheckboxList extends Component {
  /**
   * layout can be:
   * (default = block)
   * inline
   *
   * @argument layout {String}
   */
  get layout() {
    if (this.args.layout) {
      return `auk-checkbox-list--${this.args.layout}`;
    }
    return '';
  }
}
