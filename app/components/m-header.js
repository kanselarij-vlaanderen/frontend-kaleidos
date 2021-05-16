import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';

export default class MHeader extends Component {
  @service session;
  @service currentSession;
  @service router;

  constructor() {
    super(...arguments);
    if (window.location.href.indexOf('http://localhost') === 0) {
      this.environmentName = 'LOCAL';
      this.environmentClass = 'vlc-environment-pill--local';
    }

    if (window.location.href.indexOf('https://kaleidos-dev.vlaanderen.be') === 0) {
      this.environmentName = 'DEV';
      this.environmentClass = 'vlc-environment-pill--dev';
    }

    if (window.location.href.indexOf('https://kaleidos-test.vlaanderen.be') === 0) {
      this.environmentName = 'TEST';
      this.environmentClass = 'vlc-environment-pill--test';
    }

    if (window.location.href.indexOf('https://kaleidos.vlaanderen.be') === 0) {
      this.environmentName = 'PROD';
      this.environmentClass = 'vlc-environment-pill--prod';
    }
  }

  get hasPublicationsEnabled() {
    return !isEmpty(ENV.APP.ENABLE_PUBLICATIONS_TAB);
  }

  get getFullUserName() {
    return `${this.currentSession.userContent.firstName} ${this.currentSession.userContent.lastName}`;
  }

  get showEnvironmentName() {
    return ['TEST', 'LOCAL', 'DEV'].indexOf(this.environmentName) >= 0;
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
