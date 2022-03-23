import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

/**
 *
 * @argument skin {String}: possible values are:
 *  "primary", "secondary" (default), "tertiary", "borderless", "muted-borderless",
 *  "danger-primary", "danger-secondary", "danger-borderless", "success-borderless", "danger-hover"
 * @argument layout {String}
 * @argument disabled {Boolean}
 * @argument loading {Boolean}: Show the button in a loading state. Overrides most other arguments.
 * @argument size {String}
 * @argument block {Boolean}
 * @argument route {String}: If a route argument is provided, this component is formed as an extension of the LinkTo component. Thus most LinkTo arguments (route, models, preventDefault, query and bubbles) can be used here.
 */
export default class Button extends Component {
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
      return `auk-button--${this.args.skin}`;
    }
    return 'auk-button--secondary';
  }

  get layoutClass() {
    if (this.args.layout === 'icon-only') {
      // TODO: Is this argument unnecessary? Could this be determined from existence of @icon && !has-block?
      return 'auk-button--icon';
    }
    return null;
  }

  get disabled() {
    if (this.args.disabled) {
      return 'auk-button--disabled';
    }
    return null;
  }

  get size() {
    if (this.args.size === 'small') {
      return 'auk-button--size-s';
    }
    return null;
  }

  get block() {
    if (this.args.block) {
      return 'auk-button--block';
    }
    return null;
  }
}
