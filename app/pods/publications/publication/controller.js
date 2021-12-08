import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  @service media;
  @service intl;
  @service toaster;
  @tracked showStatusModal = false;

  @tracked sidebarIsOpen = this.media.get('isBigScreen');

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
  }

  @action
  openStatusModal() {
    this.showStatusModal = true;
  }

  @action
  closeStatusModal() {
    this.showStatusModal = false;
  }
}
