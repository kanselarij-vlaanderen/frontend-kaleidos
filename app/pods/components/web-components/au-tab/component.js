import Component from '@glimmer/component';

export default class Tab extends Component {
  get route() {
    if (this.args.skin) {
      return this.args.skin;
    }
    return null;
  }
  get icon() {
    if (this.args.icon) {
      return this.args.icon;
    }
    return null;
  }

  get layout() {
    if (this.args.layout) {
      return this.args.layout;
    }
    return null;
  }

  get counter() {
    if (this.args.counter) {
      return this.args.counter;
    }
    return 0;
  }
}
