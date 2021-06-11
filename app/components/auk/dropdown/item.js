import Component from '@glimmer/component';

/**
 * Dropdown item. Takes most arguments that LinkTo takes for creating a dropdown element that links somewhere
 *
 * @argument {String} class: Sets the css class of the wrapping <li>
 * @argument {String} skin
 * @argument {String} href: Set an (external) href link instead of composing one with LinkTo
 * @argument {Boolean} textOnly: textual-only dropdown element. No <LinkTo> nor <a>
 */
export default class Item extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-menu__item--${this.args.skin}`;
    }
    return null;
  }
}
