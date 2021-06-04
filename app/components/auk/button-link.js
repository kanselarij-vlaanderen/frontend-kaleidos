import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

/**
 *
 * A button that looks like a link. Apart from arguments specified below, this component has the same arguments-interface as Ember's "LinkTo" (@route, @model, ...)
 *
 * @argument skin {String}: possible value: "muted"
 * @argument padded {String}: possible values: "padded", "padded-y"
 * @argument icon {String}
 * @argument layout {String}: Determines the layout of the button.
 *   The layout is automatically determined from the existence of @icon, unless `icon-only` is specified this will result in a button layout with icon on the left.
 *   possible values: "icon-only", "icon-right"
 * @argument href {String}: Links to an external URL
 * @argument block {Boolean}: Determines whether the button is rendered as a block.
 */
export default class ButtonLink extends Component {
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

  /**
   * skin can be
   * (default, no skin)
   * muted
   */
  get skin() {
    if (this.args.skin) {
      return `auk-button--${this.args.skin}`;
    }
    return null;
  }

  get block() {
    if (this.args.block) {
      return 'auk-button-link--block';
    }
    return null;
  }

  get padded() {
    if (this.args.padded === 'padded') {
      return 'auk-button-link--padded';
    } else if (this.args.padded === 'padded-y') {
      return 'auk-button-link--padded-y';
    }
    return null;
  }
}
