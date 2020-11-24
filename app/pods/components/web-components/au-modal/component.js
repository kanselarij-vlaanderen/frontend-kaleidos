import Component from '@glimmer/component';

export default class Modal extends Component {
  /**
   * size can be:
   * large (default)
   * full-screen
   */
  get size() {
    if (this.args.size) {
      return `auk-modal--${this.args.size}`;
    }
    return 'auk-modal--large';
  }
}
