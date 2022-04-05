import Component from '@glimmer/component';

/**
 *
 * @argument {String} size: Size can be: "full-screen", "full-screen-padded", "large (default)", "medium", "small"
 * @argument {Boolean} headerless: Determines if a header is visible inside the modal
 * @argument {Boolean} footerless: Determines if a footer is visible inside the modal
 */
export default class Modal extends Component {
  get size() {
    if (this.args.size) {
      if (this.args.size === 'full-screen-padded') {
        return 'auk-modal--full-screen auk-u-p-4';
      }
      return `auk-modal--${this.args.size}`;
    }
    // default
    return 'auk-modal--large';
  }
}
