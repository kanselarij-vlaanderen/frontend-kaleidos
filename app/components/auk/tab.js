import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * A (nav) tab. Takes most arguments that LinkTo takes.
 *
 * @argument {Number} counter: Count number to display next to tab label
 * @argument {String} layout: can be (default, "icon-left") or "icon-right"
 * @argument {Boolean} isHierarchicalBack: Flag to apply custom styling for "hierarchical back button"-tab
 * @argument {String} fallBackRoute: Route to fall back on
 * @argument {Boolean} active: Helps achieve active state without route
 */
export default class Tab extends Component {
  @service transitionHistory;
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
    if (isPresent(this.args.icon)) {
      return this.args.icon;
    } else if (this.args.isHierarchicalBack) {
      return 'hierarchical-back';
    }
    return null;
  }

  get query() {
    if (isPresent(this.args.query)) {
      return this.args.query;
    }
    // return empty object
    return [];
  }

  @action
  transitionBack() {
    this.transitionHistory.goBack(this.args.fallBackRoute);
  }
}
