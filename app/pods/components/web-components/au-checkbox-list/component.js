import Component from '@glimmer/component';

export default class CheckboxList extends Component {
  get layout() {
    if (this.args.layout) {
      return `auk-checkbox-list--${this.args.layout}`;
    }
    return '';
  }
}
