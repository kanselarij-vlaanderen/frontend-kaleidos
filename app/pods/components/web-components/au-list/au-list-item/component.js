import Component from '@glimmer/component';

export default class AuListItem extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-list__item--${this.args.skin}`;
    }
    return null;
  }
}
