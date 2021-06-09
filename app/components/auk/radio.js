import Component from '@glimmer/component';

export default class Radio extends Component {
  get name() {
    if (!this.args.name) {
      console.error('radio items should have names');
      return 'radio-buttons';
    }
    return this.args.name;
  }
}
