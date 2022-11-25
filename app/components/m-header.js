import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

const environmentNames = {
  localhost: 'LOCAL',
  'kaleidos-dev.vlaanderen.be': 'DEV',
  'kaleidos-test.vlaanderen.be': 'TEST',
};

export default class MHeader extends Component {
  @service currentSession;
  @service impersonation;
  @service router;
  @service session;
  @service store;
  @service toaster;
  @service intl;

  @tracked showImpersonateUsers = false;
  @tracked memberships;

  constructor() {
    super(...arguments);
    this.loadMemberships.perform();

    const hostname = window.location.hostname;
    if (environmentNames[hostname]) {
      this.environmentName = environmentNames[hostname];
      this.environmentClass = `vlc-environment-pill--${this.environmentName.toLowerCase()}`;
    } else {
      this.environmentName = null;
      this.environmentClass = null;
    }
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
  toggleShowImpersonateUsers(e) {
    e.stopPropagation();
    this.showImpersonateUsers = !this.showImpersonateUsers;
  }

  @action
  async impersonate(membership) {
    this.showImpersonateUsers = false;
    const user = await membership.user;
    const account = await user.account;
    try {
      await this.impersonation.impersonate(account, membership);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-impersonation', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    await this.router.refresh();
  }

  @task
  *loadMemberships() {
    this.memberships = yield this.store.query('membership', {
      filter: {
        user: {
          account: {
            provider: 'https://github.com/kanselarij-vlaanderen/mock-login-service',
          }
        }
      },
      sort: 'user.last-name,user.first-name',
      include: 'user',
    });
  }
}
