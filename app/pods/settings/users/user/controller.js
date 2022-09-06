import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SettingsUsersUserController extends Controller {
  @service intl;
  @service toaster;

  @action
  async setAndSaveGroup(group) {
    this.model.set('group', group);
    await this.model.save();
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @tracked showBlockRelation = false;

  @action
  blockRelation() {
    this.showBlockRelation = !this.showBlockRelation;
  }

  @action
  addBlockRelation() {
    this.showBlockRelation = !this.showBlockRelation;
    this.toaster.success("De werkrelatie is geblokkeerd.");
  }

  @tracked showUnblockRelation = false;

  @action
  unblockRelation() {
    this.showUnblockRelation = !this.showUnblockRelation;
  }

  @action
  addUnblockRelation() {
    this.showUnblockRelation = !this.showUnblockRelation;
    this.toaster.success("De werkrelatie is geblokkeerd.");
  }

  @tracked showBlockPerson = false;

  @action
  blockPerson() {
    this.showBlockPerson = !this.showBlockPerson;
  }

  @action
  addBlockPerson() {
    this.showBlockPerson = !this.showBlockPerson;
    this.toaster.success("De persoon is geblokkeerd.");
  }

}
