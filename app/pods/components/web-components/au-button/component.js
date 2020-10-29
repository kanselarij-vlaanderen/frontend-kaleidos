import Component from '@glimmer/component';

export default class Button extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-button--${this.args.skin}`;
    }
    return 'auk-button--secondary';
  }

  get layout() {
    if (this.args.layout === 'icon-only') {
      return 'auk-button--icon';
    }
    return null;
  }

  get size() {
    if (this.args.size === 'small') {
      return 'auk-button--size-s';
    }
    return null;
  }

  get block() {
    if (this.args.block) {
      return 'auk-button--block';
    }
    return null;
  }

  get icon() {
    if (this.args.icon) {
      return 'auk-button--icon ';
    }
    return null;
  }
}
