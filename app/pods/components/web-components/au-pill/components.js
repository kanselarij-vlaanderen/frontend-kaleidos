import Component from '@glimmer/component';

export default class Pill extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-pill--${this.args.skin}`;
    }
    return 'auk-pill--default';
  }

  get layout() {
    if (this.args.layout) {
      return `auk-pill--${this.args.layout}`;
    }
    return '';
  }
}
