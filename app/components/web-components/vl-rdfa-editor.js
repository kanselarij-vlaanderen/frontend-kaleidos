import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['vl-editor'],
  classNameBindings: ['isLarge:--large'],

  userAgent: service(),

  browserName: computed('userAgent.browser', function() {
    /* Not achievable through simple alias, since "browser" object doesn't support "get" */
    const browser = this.userAgent.get('browser');
    return browser.info.name;
  }),

  browserIsSupported: computed('userAgent.browser', function() {
    const browser = this.userAgent.get('browser');
    // TODO, for some reason, DES#705 was failing on rdfa editor tests due to not supported
    if (browser.info.name === 'Electron') {
      return true;
    }
    return (browser.isFirefox
      || browser.isChrome
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
  }),

  actions: {
    handleRdfaEditorInit(editorInterface) {
      this.handleRdfaEditorInit(editorInterface);
    },
  },
});
