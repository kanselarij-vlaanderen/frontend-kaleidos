import Component from '@glimmer/component';

export default class Radio extends Component {
  get sublabel() {
    if (this.args.sublabel) {
      return this.args.sublabel;
    }
    return false;
  }

  get name() {
    if (!this.args.name) {
      console.error('radio items should have names');
      return 'radio-buttons';
    }
    return this.args.name;
  }
}
