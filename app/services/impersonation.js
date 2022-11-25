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
    const response = await fetch('/impersonate/current', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      // Spooky error 👻
    } else {
      const impersonatedAccountId = result.data.relationships?.acount?.data?.id;
      const impersonatedMembershipId = result.data.relationships?.membership?.data?.id;
      if (impersonatedAccountId && impersonatedMembershipId) {
        this.account = await this.store.findRecord('account', impersonatedAccountId);
        this.membership = await this.store.findRecord('membership', impersonatedMembershipId);
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
    const response = await fetch('/impersonate/current', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({ impersonatedAccount: account.uri, impersonatedMembership: membership.uri }),
    });
    if (!response.ok) {
      // Spooky error 👻
    } else {
      this.account = account;
      this.membership = membership;
      this.user = await this.account.user;
      this.organization = await this.membership.organization;
      this.role = await this.membership.role;
    }
  }
}
