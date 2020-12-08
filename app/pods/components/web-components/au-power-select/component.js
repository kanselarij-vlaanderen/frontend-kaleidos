import Component from '@glimmer/component';

export default class PowerSelect extends Component {
  get options() {
    if (this.args.options) {
      return this.args.options;
    }
    return null;
  }

  get isSearchable() {
    return this.args.isSearchable;
  }

  get placeholder() {
    if (this.args.placeholder) {
      return this.args.placeholder;
    }
    return null;
  }
}
