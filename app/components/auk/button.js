import Component from '@glimmer/component';

export default class Button extends Component {
  /**
   * skin can be:
   * primary
   * secondary (default)
   * tertiary
   * borderless
   * borderless-muted
   * danger-primary
   * danger-hover
   */
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

  get disabled() {
    if (this.args.disabled) {
      return 'auk-button--disabled';
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
}
