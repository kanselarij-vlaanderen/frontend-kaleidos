import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

/**
 * Dropdown item. Takes most arguments that LinkTo takes for creating a dropdown element that links somewhere
 *
 * @argument {String} class: Sets the css class of the wrapping <li>
 * @argument {String} skin
 * @argument {String} href: Set an (external) href link instead of composing one with LinkTo
 * @argument {Boolean} textOnly: textual-only dropdown element. No <LinkTo> nor <a>
 */
export default class Item extends Component {
  // Workaround for linkTo not accepting @model and @models parameter, regardless if one is null
  // https://github.com/emberjs/ember.js/issues/18265
  @computed('args.{model,models}')
  get models() {
    const hasModel = 'model' in this.args;
    const hasModels = 'models' in this.args;

    assert(
      'You cannot provide both the `@model` and `@models` arguments.',
      !hasModel || !hasModels
    );

    if (hasModel) {
      return [this.args.model];
    } else if (hasModels) {
      return this.args.models;
    }
    return [];
  }

  get skin() {
    if (this.args.skin) {
      return `auk-menu__item--${this.args.skin}`;
    }
    return null;
  }
}
