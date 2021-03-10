import Component from '@glimmer/component';

export default class Modal extends Component {
  /**
   * size can be:
   * large (default)
   * medium
   * small
   */
  get size() {
    if (this.args.size) {
      if (this.args.resized) {
        return 'auk-modal--full-screen';
      }
      // if not resized, use the size given
      return `auk-modal--${this.args.size}`;
    }
    // no size from args
    if (this.args.resized) {
      return 'auk-modal--full-screen';
    }
    // default
    return 'auk-modal--large';
  }
}
