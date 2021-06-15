import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} auto
 * @argument {Number} size
 */
export default class Toolbar extends Component {
  get auto() {
    if (this.args.auto) {
      return 'auk-toolbar-complex--auto';
    }
    return null;
  }

  get size() {
    if (this.args.size) {
      return `auk-toolbar-complex--${this.args.size}`;
    }
    return null;
  }
}
