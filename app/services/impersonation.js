import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fetch } from 'fetch';

class UserData {
  @tracked account;
  @tracked user;
  @tracked organization;
  @tracked role;
  @tracked membership;

  clear() {
    this.account = null;
    this.user = null;
    this.organization = null;
    this.role = null;
    this.membership = null;
  }
}

export default class ImpersonationService extends Service {
  @service store;

  impersonator = new UserData();
  impersonated = new UserData();

  get account() {
    return this.impersonated.account ?? this.impersonator.account;
  }

  get user() {
    return this.impersonated.user ?? this.impersonator.user;
  }

  get organization() {
    return this.impersonated.organization ?? this.impersonator.organization;
  }

  get role() {
    return this.impersonated.role ?? this.impersonator.role;
  }

  get membership() {
    return this.impersonated.membership ?? this.impersonator.membership;
  }

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
      const impersonatorAccountId = result.data.relationships.impersonatorAccount.data.id;
      const impersonatorMembershipId = result.data.relationships.impersonatorMembership.data.id;
      this.impersonator.account = await this.store.findRecord('account', impersonatorAccountId);
      this.impersonator.membership = await this.store.findRecord('membership', impersonatorMembershipId);
      this.impersonator.user = await this.impersonator.account.user;
      this.impersonator.organization = await this.impersonator.membership.organization;
      this.impersonator.role = await this.impersonator.membership.role;

      const impersonatedAccountId = result.data.relationships.impersonatedAccount?.data?.id;
      const impersonatedMembershipId = result.data.relationships.impersonatedMembership?.data?.id;
      if (impersonatedAccountId && impersonatedMembershipId) {
        this.impersonated.account = await this.store.findRecord('account', impersonatedAccountId);
        this.impersonated.membership = await this.store.findRecord('membership', impersonatedMembershipId);
        this.impersonated.user = await this.impersonated.account.user;
        this.impersonated.organization = await this.impersonated.membership.organization;
        this.impersonated.role = await this.impersonated.membership.role;
      }
    }
  }

  clear() {
    this.impersonator.clear();
    this.impersonated.clear();
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
      this.impersonated.account = account;
      this.impersonated.membership = membership;
      this.impersonated.user = await this.impersonated.account.user;
      this.impersonated.organization = await this.impersonated.membership.organization;
      this.impersonated.role = await this.impersonated.membership.role;
    }
  }
}
