// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  intl: inject(),
  message: null,
  title: null,
  showActions: true,
  buttonType: 'danger',
  showVerify: true,
  buttonText: 'delete',

  verifyButtonText: computed('intl', 'buttonText', function() {
    return this.intl.t(this.get('buttonText'));
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-component-lifecycle-hooks
  didInsertElement() {
    this.get('element').querySelector('[role="dialog"]')
      .focus();
  },

  showIcon: computed('buttonType', function() {
    return this.buttonType !== 'warning';
  }),

  buttonSkin: computed('buttonType', function() {
    if (this.buttonType === 'danger') {
      return 'danger-primary';
    }
    return 'primary';
  }),

  keyDown(event) {
    if (event.key === 'Escape') {
      this.cancel();
    }
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    verify() {
      this.verify();
    },

    cancel() {
      this.cancel();
    },
  },
});
