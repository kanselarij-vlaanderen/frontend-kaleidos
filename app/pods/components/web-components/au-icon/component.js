import Component from '@glimmer/component';

export default class Icon extends Component {
  get getIcon() {
    return `${this.args.name}`;
  }

  get size() {
    if (this.args.size) {
      return `auk-icon--${this.args.size}`;
    }
    return 'auk-icon--default';
  }
}
