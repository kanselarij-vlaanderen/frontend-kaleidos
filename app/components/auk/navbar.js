import Component from '@glimmer/component';

/**
 *
 * @argument {String} border Can be "top", "bottom" (default) or "none"
 * @argument {String} skin Can be "gray-100", "gray-200" or "white (default)"
 * @argument {String} size Can be "large"
 * @argument {Boolean} auto Makes height automatic
 * @argument {Boolean} noPadding
 */
export default class Navbar extends Component {
  get border() {
    if (this.args.border) {
      return `auk-navbar--bordered-${this.args.border}`;
    }
    return 'auk-navbar--bordered-bottom';
  }

  get skin() {
    if (this.args.skin) {
      return `auk-navbar--${this.args.skin}`;
    }
    return 'auk-navbar--white';
  }

  get size() {
    if (this.args.size) {
      return `auk-navbar--${this.args.size}`;
    }
    return '';
  }

  get auto() {
    if (this.args.auto) {
      return 'auk-navbar--auto';
    }
    return '';
  }

  get noPadding() {
    if (this.args.noPadding) {
      return 'auk-navbar--no-pad';
    }
    return '';
  }
}
