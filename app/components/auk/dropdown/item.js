import Component from '@glimmer/component';

export default class Item extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-menu__item--${this.args.skin}`;
    }
    return null;
  }
}
