import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SettingsUsersUserController extends Controller {
  @service intl;
  @service toaster;

  @action
  async setAndSaveGroup(group) {
    this.model.set('group', group);
    await this.model.save();
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
