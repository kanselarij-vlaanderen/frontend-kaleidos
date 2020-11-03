import Component from '@glimmer/component';

export default class AuInput extends Component {
  get block() {
    if (this.args.block) {
      return 'auk-input--block';
    }

    return null;
  }

  get error() {
    if (this.args.error === 'true') {
      return 'auk-input--error';
    }

    return null;
  }
}
