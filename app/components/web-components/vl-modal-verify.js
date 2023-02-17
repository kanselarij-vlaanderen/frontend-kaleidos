// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

/**
 * @param title {string}
 * @param message {string}
 * @param showActions {Boolean}
 * @param showVerify {Boolean}
 * @param buttonType {string}
 * @param verifyButtonText {string}
 * @param isLoading {string}
 * @param onVerify {Function}
 * @param onCancel {Function}
 */
export default class WebComponentsVlModalVerify extends Component {
  @service intl;

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

  get verifyButtonText() {
    return this.args.verifyButtonText ?? this.intl.t('delete');
  }

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
