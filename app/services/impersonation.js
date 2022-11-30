import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fetch } from 'fetch';
import ENV from 'frontend-kaleidos/config/environment';

const IMPERSONATION_ENABLED = ENV.APP.ENABLE_IMPERSONATION;

export default class ImpersonationService extends Service {
  @service store;

  @tracked role;

  async load() {
    if (IMPERSONATION_ENABLED) {
      const response = await fetch('/impersonations/current', {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.api+json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        const impersonatedRoleId = result.data.relationships?.['impersonated-role']?.data?.id;
        if (impersonatedRoleId) {
          this.role = await this.store.findRecord('role', impersonatedRoleId);
        }
      } else {
        throw new Error('An exception occurred while loading impersonation data: ' + JSON.stringify(result.errors));
      }
    }
  }

  async impersonate(role) {
    if (IMPERSONATION_ENABLED) {
      const response = await fetch('/impersonations', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'sessions',
            relationships: {
              'impersonated-role': {
                data: {
                  type: 'roles',
                  id: role.id
                }
              }
            }
          }
        }),
      });
      if (response.ok) {
        this.role = role;
      } else {
        const result = await response.json();
        throw new Error('An exception occurred while impersonating someone: ' + JSON.stringify(result.errors));
      }
    }
  }

  async stopImpersonation() {
    if (IMPERSONATION_ENABLED) {
      const response = await fetch('/impersonations/current', {
        method: 'DELETE',
      });
      if (response.ok) {
        this.role = null;
      }
    }
  }
}
