// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  userAgent: service(),

  browserName: computed('userAgent.browser', function() {
    /* Not achievable through simple alias, since "browser" object doesn't support "get" */
    const browser = this.userAgent.get('browser');
    return browser.info.name;
  }),

  browserIsSupported: computed('userAgent.browser', function() {
    const browser = this.userAgent.get('browser');
    return (window.Cypress
      || browser.isFirefox
      || browser.isChrome
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    handleRdfaEditorInit(editorInterface) {
      this.handleRdfaEditorInit(editorInterface);
    },
  },
});
