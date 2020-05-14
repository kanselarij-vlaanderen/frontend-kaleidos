import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  currentSession: service(),
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
      await this.currentSession.logout();
    }
  },
});
