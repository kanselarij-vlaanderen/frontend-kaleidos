import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  @service media;

  @tracked sidebarIsOpen = this.get('media.isBigScreen');

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  @action
  saveSidebarProperty(modifiedObject) {
    modifiedObject.save();
  }
}
