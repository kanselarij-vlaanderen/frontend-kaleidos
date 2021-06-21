import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class SettingsUsersUserController extends Controller {
  @action
  async setAndSaveGroup(group) {
    this.model.set('group', group);
    await this.model.save();
  }
}
