import Component from '@glimmer/component';

export default class InnerLayout extends Component {
  get icon() {
    if (this.args.icon) {
      return true;
    }
    return false;
  }
  get counter() {
    if (this.args.counter) {
      return true;
    }
    return false;
  }
}
