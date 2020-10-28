import Component from '@glimmer/component';

export default class KeyValue extends Component {
  get layout() {
    if (this.args.layout) {
      return `au2-key-value-item--${this.args.layout}`;
    }
    return null;
  }
}
