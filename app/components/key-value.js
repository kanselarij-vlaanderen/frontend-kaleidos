import Component from '@glimmer/component';

export default class KeyValueComponent extends Component {
  get layout() {
    if (this.args.layout) {
      return `vlc-key-value-item--${this.args.layout}`;
    }
    return '';
  }
}
