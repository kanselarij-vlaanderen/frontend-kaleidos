import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  // Services.
  @service intl;
  @service media;

  @tracked latestSubcaseOnMeeting;

  @tracked sidebarIsOpen = this.get('media.isBigScreen');

  get casePath() {
    let title = this.intl.t('publication-flow');
    const publicationNumber = this.model.identification.get('idName');
    if (!this.latestSubcaseOnMeeting) {
      title = title.concat(' - ', this.intl.t('not-via-cabinet'), ' - ', publicationNumber || '');
    } else {
      title = title.concat(' - ', this.intl.t('via-cabinet'), ' - ', publicationNumber || '');
    }
    return title;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  @action
  saveSidebarProperty(modifiedObject) {
    modifiedObject.save();
  }
}
