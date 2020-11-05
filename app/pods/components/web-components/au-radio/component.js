import Component from '@glimmer/component';

export default class Radio extends Component {
  get sublabel() {
    if (this.args.sublabel) {
      return this.args.sublabel;
    }
    return false;
  }
}
