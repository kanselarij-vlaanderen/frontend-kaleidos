import Component from '@glimmer/component';

export default class Modal extends Component {
  /**
   * size can be:
   * full-screen
   * full-screen-padded
   * large (default)
   * medium
   * small
   */
  get size() {
    if (this.args.resized) {
      return 'auk-modal--full-screen';
    }
    // if not resized, use the size given
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
