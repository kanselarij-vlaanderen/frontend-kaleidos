import Component from '@glimmer/component';

export default class Label extends Component {
  get class() {
    if (this.args.error) {
      return 'auk-label-error';
    }
    return 'auk-label';
  }
}
