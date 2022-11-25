import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fetch } from 'fetch';

export default class ImpersonationService extends Service {
  @service store;

  @tracked account;
  @tracked user;
  @tracked organization;
  @tracked role;
  @tracked membership;

  async load() {
    const response = await fetch('/who-am-i', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error('An exception occurred while loading impersonation data: ' + JSON.stringify(result.errors));
    } else {
      const impersonatorAccountId = result.data.relationships?.account?.data?.id;
      const impersonatorMembershipId = result.data.relationships?.membership?.data?.id;
      if (impersonatorAccountId && impersonatorMembershipId) {
        this.account = await this.store.findRecord('account', impersonatorAccountId);
        this.membership = await this.store.findRecord('membership', impersonatorMembershipId);
        this.user = await this.account.user;
        this.organization = await this.membership.organization;
        this.role = await this.membership.role;
      }
    }
  }

  clear() {
    this.account = null;
    this.user = null;
    this.organization = null;
    this.role = null;
    this.membership = null;
  }

  async impersonate(account, membership) {
    const response = await fetch('/impersonate', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'sessions',
          relationships: {
            account: {
              type: 'accounts',
              id: account.id,
              attributes: {
                uri: account.uri,
              }
            },
            membership: {
              type: 'memberships',
              id: membership.id,
              attributes: {
                uri: membership.uri,
              }
            }
          }
        }
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error('An exception occurred while impersonating someone: ' + JSON.stringify(result.errors));
    } else {
      const impersonatorAccountId = result.data.relationships?.account?.data?.id;
      const impersonatorMembershipId = result.data.relationships?.membership?.data?.id;
      if (impersonatorAccountId && impersonatorMembershipId) {
        this.account = await this.store.findRecord('account', impersonatorAccountId);
        this.membership = await this.store.findRecord('membership', impersonatorMembershipId);
        this.user = await this.account.user;
        this.organization = await this.membership.organization;
        this.role = await this.membership.role;
      }
    }
  }

  async stopImpersonation() {
    const response = await fetch('/impersonate', {
      method: 'DELETE',
    });
    if (response.ok) {
      this.clear();
    }
  }
}
