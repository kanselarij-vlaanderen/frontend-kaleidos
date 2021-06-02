import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

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
