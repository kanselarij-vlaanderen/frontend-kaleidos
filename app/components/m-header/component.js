import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-display-block'],
  options: null,
  selectedOption: null,
  isOc: null,

  init() {
    this._super(...arguments);
    if (window.location.href.indexOf('http://localhost') == 0) {
      this.set('environmentName', 'LOCAL');
    }

    if (window.location.href.indexOf('https://kaleidos-dev.vlaanderen.be') == 0) {
      this.set('environmentName', 'DEV');
    }

    if (window.location.href.indexOf('https://kaleidos-test.vlaanderen.be') == 0) {
      this.set('environmentName', 'TEST');
    }
  },

  showEnvironmentName: computed('environmentName', function() {
    return ['TEST', 'LOCAL', 'DEV'].indexOf(this.environmentName) >= 0;
  }),

  actions: {
    async logout() {
      await this.logoutUser();
    },
    setAction(option) {
      this.navigateToRoute(option);
    },
  },
});
