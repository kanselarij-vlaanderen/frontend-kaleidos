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
    this._super(...arguments);
    this.get('element').querySelector('[role="dialog"]')
      .focus();
  },

  showDestructiveIcon: computed('buttonType', function() {
    return this.buttonType !== 'warning';
  }),

  isAlertButton: computed.equal('buttonType', 'danger'),

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
