import Component from '@glimmer/component';

export default class ButtonLink extends Component {
  /**
   * skin can be
   * (default, no skin)
   * muted
   */
  get skin() {
    if (this.args.skin) {
      return `auk-button-link--${this.args.skin}`;
    }
    return '';
  }

  get block() {
    if (this.args.block) {
      return 'auk-button-link--block';
    }
    return '';
  }

  get padded() {
    if (this.args.padded === 'padded') {
      return 'auk-button-link--padded';
    }
    if (this.args.padded === 'padded-y') {
      return 'auk-button-link--padded-y';
    }
    return '';
  }
}
