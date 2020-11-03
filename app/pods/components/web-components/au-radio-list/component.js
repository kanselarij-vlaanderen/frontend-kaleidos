import Component from '@glimmer/component';

export default class RadioList extends Component {
  get layout() {
    if (this.args.layout) {
      return `auk-radio-list--${this.args.layout}`;
    }
    return '';
  }
}
