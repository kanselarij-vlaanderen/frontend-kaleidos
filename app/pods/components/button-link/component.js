import Component from '@glimmer/component';

export default class ButtonLink extends Component {
  get skin() {
    if (this.args.skin) {
      return `c-button-link--${this.args.skin}`;
    }

    return null;
  }

  get block() {
    if (this.args.block) {
      return 'c-button-link--block';
    }

    return null;
  }

  get padded() {
    if (this.args.padded === 'padded') {
      return 'c-button-link--padded';
    }
    if (this.args.padded === 'padded-y') {
      return 'c-button-link--padded-y';
    }

    return null;
  }
}
