import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
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

  get isShownPublications() {
    return this.currentSession.may('manage-publication-flows');
  }

  get isShownSignatureFolder() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @tracked showSwitch = false;

  @action
  switch() {
    this.showSwitch = !this.showSwitch;
  }
}
