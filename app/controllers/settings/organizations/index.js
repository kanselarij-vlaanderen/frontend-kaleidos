import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SettingsOrganizationsIndexController extends Controller {
  @service store;

  @tracked size = 10;
  @tracked page = 0;
  @tracked sort = 'identifier';
  @tracked filter;

  @tracked organizationBeingBlocked = null;

  @tracked showBlockOrganization = false;
  @tracked showUnblockOrganization = false;

  @action
  async blockOrganization() {
    const blocked = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.BLOCKED);
    this.organizationBeingBlocked.status = blocked;
    await this.organizationBeingBlocked.save();
  }

  @action
  async unblockOrganization() {
    const allowed = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.ALLOWED);
    this.organizationBeingBlocked.status = allowed;
    await this.organizationBeingBlocked.save();
  }
}
