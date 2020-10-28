import Component from '@glimmer/component';

export default class Pill extends Component {
  get skin() {
    if (this.args.skin) {
      return `au2-pill--${this.args.skin}`;
    }
    return 'au2-pill--default';
  }
  get layout() {
    if (this.args.layout) {
      return `au2-pill--${this.args.layout}`;
    }
    return null;
  }
}
