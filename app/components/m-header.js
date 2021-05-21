import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';

const environmentNames = {
  localhost: 'LOCAL',
  'kaleidos-dev.vlaanderen.be': 'DEV',
  'kaleidos-test.vlaanderen.be': 'TEST',
};

export default class MHeader extends Component {
  @service session;
  @service currentSession;
  @service router;

  constructor() {
    super(...arguments);

    const hostname = window.location.hostname;
    if (environmentNames[hostname]) {
      this.environmentName = environmentNames[hostname];
      this.environmentClass = `vlc-environment-pill--${this.environmentName.toLowerCase()}`;
    } else {
      this.environmentName = null;
      this.environmentClass = null;
    }
  }

  get hasPublicationsEnabled() {
    return !isEmpty(ENV.APP.ENABLE_PUBLICATIONS_TAB);
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
