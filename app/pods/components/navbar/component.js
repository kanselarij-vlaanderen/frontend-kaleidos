import Component from '@glimmer/component';

export default class Navbar extends Component {
  get border() {
    if (this.args.border === 'top') {
      return 'vlc-navbar--bordered-top';
    }

    if (this.args.border === 'bottom') {
      return 'vlc-navbar--bordered-bottom';
    }

    if (this.args.border === 'none') {
      return '';
    }

    return 'vlc-navbar--bordered-bottom';
  }

  get skin() {
    if (this.args.skin === 'gray-100') {
      return 'vlc-navbar--gray-100 ';
    }

    if (this.args.skin === 'gray-200') {
      return 'vlc-navbar--gray-200 ';
    }

    return 'vlc-navbar--white';
  }

  get size() {
    if (this.args.size === 'large') {
      return 'vlc-navbar--large';
    }

    return '';
  }

  get auto() {
    if (this.args.auto) {
      return 'vlc-navbar--auto';
    }
    return '';
  }
}
