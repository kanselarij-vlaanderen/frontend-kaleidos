import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} flex possible value "gray-100"
 * @argument {String} skin
 */
export default class ListItem extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-list__item--${this.args.skin}`;
    }
    return null;
  }
}
