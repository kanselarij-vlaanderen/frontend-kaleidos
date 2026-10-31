import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fetch } from 'fetch';
import { isEnabledImpersonation } from 'frontend-kaleidos/utils/feature-flag';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

export default class ImpersonationService extends Service {
  @service store;

  @tracked role;

  async load() {
    if (isEnabledImpersonation()) {
      const response = await fetch('/impersonations/current', {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.api+json',
        },
      });
      try {
        const result = await getJsonPayloadOrThrow(response);
        const impersonatedRoleId = result.data.relationships?.['impersonated-role']?.data?.id;
        if (impersonatedRoleId) {
          this.role = await this.store.findRecord('role', impersonatedRoleId);
        }
      } catch (error) {
        console.log('Could not continue impersonated session');
        throw error;
      }
    }
  }

  async impersonate(role) {
    if (isEnabledImpersonation()) {
      const response = await fetch('/impersonations', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'impersonations',
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
        await getJsonPayloadOrThrow(response);
      }
    }
  }

  async stopImpersonation() {
    if (isEnabledImpersonation()) {
      const response = await fetch('/impersonations/current', {
        method: 'DELETE',
      });
      if (response.ok) {
        this.role = null;
      }
    }
  }
}
