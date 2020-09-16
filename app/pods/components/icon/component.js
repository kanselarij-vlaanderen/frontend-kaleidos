import Component from '@glimmer/component';

export default class Icon extends Component {
  get size() {
    if (this.args.size) {
      return `vlc-icon--${this.args.size}`;
    }

    return 'vlc-icon--default';
  }
}
