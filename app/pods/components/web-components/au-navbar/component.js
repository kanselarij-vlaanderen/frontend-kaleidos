import Component from '@glimmer/component';

export default class Navbar extends Component {
  get border() {
    if (this.args.border === 'top') {
      return 'au2-navbar--bordered-top';
    }
    if (this.args.border === 'bottom') {
      return 'au2-navbar--bordered-bottom';
    }
    if (this.args.border === 'none') {
      return '';
    }
    return 'au2-navbar--bordered-bottom';
  }

  get skin() {
    if (this.args.skin === 'gray-100') {
      return 'au2-navbar--gray-100 ';
    }
    if (this.args.skin === 'gray-200') {
      return 'au2-navbar--gray-200 ';
    }
    return 'au2-navbar--white';
  }

  get size() {
    if (this.args.size === 'large') {
      return 'au2-navbar--large';
    }
    return '';
  }

  get auto() {
    if (this.args.auto) {
      return 'au2-navbar--auto';
    }
    return '';
  }
}
