import Component from '@glimmer/component';

export default class Navbar extends Component {
  /**
   * border can be:
   * top
   * bottom (default)
   * none
   */
  get border() {
    if (this.args.border) {
      return `auk-navbar--bordered-${this.args.border}`;
    }
    return null;
  }

  /**
   * skin can be:
   * gray-100
   * gray-200
   * white (default)
   */
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
