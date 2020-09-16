import Component from '@glimmer/component';

export default class Button extends Component {
  get skin() {
    if (this.args.skin) {
      return `vlc-button--${this.args.skin}`;
    }

    return 'vlc-button--secondary';
  }

  get layout() {
    if (this.args.layout === 'icon-only') {
      return 'vlc-button--icon';
    }

    return null;
  }

  get size() {
    if (this.args.size === 'small') {
      return 'vlc-button--size-s';
    }

    return null;
  }

  get block() {
    if (this.args.block) {
      return 'vlc-button--block';
    }

    return null;
  }
}
