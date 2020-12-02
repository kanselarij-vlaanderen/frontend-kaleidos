import Component from '@glimmer/component';

export default class Modal extends Component {
  /**
   * size can be:
   * large (default)
   * full-screen
   * medium
   * small
   */
  get size() {
    let size;
    if (this.args.size) {
      if (this.args.resized) {
        // if size is already full-screen, resize to large
        if (this.args.size === 'full-screen') {
          size = 'auk-modal--large';
        } else {
          size = 'auk-modal--full-screen';
        }
      } else {
        // if not resized, use the size given
        size = `auk-modal--${this.args.size}`;
      }
    } else {
      if (this.args.resized) {
        size = 'auk-modal--full-screen';
      } else {
        // default
        size = 'auk-modal--large';
      }
    }

    return size;
  }
}
