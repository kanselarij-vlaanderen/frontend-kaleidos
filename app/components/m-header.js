import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const environmentNames = {
  localhost: 'LOCAL',
  'kaleidos-dev.vlaanderen.be': 'DEV',
  'kaleidos-test.vlaanderen.be': 'TEST',
};

export default class MHeader extends Component {
  @service currentSession;
  @service impersonation;
  @service session;
  @service store;
  @service toaster;
  @service intl;

  @tracked showRoles = false;
  @tracked roles;

  constructor() {
    super(...arguments);
    this.loadRoles.perform();

    const hostname = window.location.hostname;
    if (environmentNames[hostname]) {
      this.environmentName = environmentNames[hostname];
      this.environmentClass = `vlc-environment-pill--${this.environmentName.toLowerCase()}`;
    } else {
      this.environmentName = null;
      this.environmentClass = null;
    }
  }

  get canImpersonate() {
    const isEnabled = ENV.APP.ENABLE_IMPERSONATION;
    const hasPermission = this.currentSession.may('impersonate-users', true);
    return isEnabled && hasPermission;
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

  @action
  toggleShowRoles(e) {
    e.stopPropagation();
    this.showRoles = !this.showRoles;
  }

  @action
  async impersonate(role) {
    this.showRoles = false;
    try {
      await this.impersonation.impersonate(role);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-change-roles', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    window.location.reload();
  }

  @action
  async stopImpersonation() {
    await this.impersonation.stopImpersonation();
    window.location.reload();
  }

  @task
  *loadRoles() {
    this.roles = yield this.store.queryAll('role', {
      'filter[concept-scheme][:uri:]': CONSTANTS.CONCEPT_SCHEMES.USER_ROLES,
      sort: 'position'
    });
  }
}
