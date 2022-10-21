// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { not } from '@ember/object/computed';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Component.extend({
  intl: inject(),
  // TODO: octane-refactor
  // eslint-disable-next-line ember/require-tagless-components
  tagName: 'button',
  type: 'button',
  classNames: ['au-c-button', 'au-c-button--primary'],
  classNameBindings: ['isLoading:is-loading'],

  focus: not('isLoading'),

  click() {
    if (this.type === 'button') {
      if (!this.isLoading) {
        this.saveAction();
      }
    }
  },
});
