import Component from '@glimmer/component';

export default class Button extends Component {
  get skin() {
    if (this.args.skin) {
      return `au2-button--${this.args.skin}`;
    }
    return 'au2-button--secondary';
  }

  get layout() {
    if (this.args.layout === 'icon-only') {
      return 'au2-button--icon';
    }
    return null;
  }

  get size() {
    if (this.args.size === 'small') {
      return 'au2-button--size-s';
    }
    return null;
  }

  get block() {
    if (this.args.block) {
      return 'au2-button--block';
    }
    return null;
  }
}
