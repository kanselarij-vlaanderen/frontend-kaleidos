import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-display-block'],

  init() {
    this._super(...arguments);
    if (window.location.href.indexOf('http://localhost') == 0) {
      this.set('environmentName', 'LOCAL');
      this.set('environmentClass', 'vlc-environment-pill--local');
    }

    if (window.location.href.indexOf('https://kaleidos-dev.vlaanderen.be') == 0) {
      this.set('environmentName', 'DEV');
      this.set('environmentClass', 'vlc-environment-pill--dev');
    }

    if (window.location.href.indexOf('https://kaleidos-test.vlaanderen.be') == 0) {
      this.set('environmentName', 'TEST');
      this.set('environmentClass', 'vlc-environment-pill--test');
    }
  },

  showEnvironmentName: computed('environmentName', function () {
    return ['TEST', 'LOCAL', 'DEV'].indexOf(this.environmentName) >= 0;
  }),

  actions: {
    async logout() {
      await this.logoutUser();
    }
  },
});
