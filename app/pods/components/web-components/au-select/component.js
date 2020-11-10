import Component from '@glimmer/component';

export default class Select extends Component {
  get block() {
    if (this.args.block) {
      return 'auk-select--block';
    }
    return '';
  }

  get error() {
    if (this.args.error === 'true') {
      return 'auk-select--error';
    }
    return '';
  }
}
