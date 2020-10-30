import Component from '@glimmer/component';

export default class Navbar extends Component {
  get border() {
    if (this.args.border === 'top') {
      return 'auk-navbar--bordered-top';
    }
    if (this.args.border === 'bottom') {
      return 'auk-navbar--bordered-bottom';
    }
    if (this.args.border === 'none') {
      return '';
    }
    return 'auk-navbar--bordered-bottom';
  }

  get skin() {
    if (this.args.skin === 'gray-100') {
      return 'auk-navbar--gray-100 ';
    }
    if (this.args.skin === 'gray-200') {
      return 'auk-navbar--gray-200 ';
    }
    return 'auk-navbar--white';
  }

  get size() {
    if (this.args.size === 'large') {
      return 'auk-navbar--large';
    }
    return '';
  }

  get auto() {
    if (this.args.auto) {
      return 'auk-navbar--auto';
    }
    return '';
  }
}
