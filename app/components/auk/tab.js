import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';


export default class Tab extends Component {
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
