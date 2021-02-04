import Component from '@glimmer/component';

export default class Checkbox extends Component {
  get mode() {
    if (this.args.mode === 'table') {
      return 'auk-checkbox__table';
    }
    return '"auk-checkbox"';
  }
}
