import Component from '@glimmer/component';

export default class Datepicker extends Component {
  get block() {
    if (this.args.block) {
      return 'auk-input--block';
    }
    return '';
  }

  get error() {
    if (this.args.error === 'true') {
      return 'auk-input--error';
    }
    return '';
  }

  get icon() {
    if (this.args.icon) {
      return this.args.icon;
    }
    return '';
  }
}
