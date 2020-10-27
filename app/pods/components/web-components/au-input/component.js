import Component from '@glimmer/component';

export default class AuInput extends Component {
  get block() {
    if (this.args.block) {
      return 'vlc-input--block';
    }

    return null;
  }

  get error() {
    if (this.args.error === 'true') {
      return 'vlc-input--error';
    }

    return null;
  }
}
