import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  // Services.
  @service intl;
  @service media;

  @tracked sidebarIsOpen = this.get('media.isBigScreen');
  @tracked showLoader = false;

  get casePath() {
    let title = this.intl.t('publication-flow');
    const publicationNumber = this.model.publicationFlow.identification.get('idName');
    if (!this.model.latestSubcaseOnMeeting) {
      title = title.concat(' - ', this.intl.t('not-via-cabinet'), ' - ', publicationNumber || '');
    } else {
      title = title.concat(' - ', this.intl.t('via-cabinet'), ' - ', publicationNumber || '');
    }
    return title;
  }

  get titleText() {
    const shortTitle = this.model.publicationFlow.case.get('shortTitle');
    if (shortTitle) {
      return shortTitle;
    }
    return this.model.publicationFlow.case.get('title');
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  @action
  saveSidebarProperty(modifiedObject) {
    modifiedObject.save();
  }

  get getClassForPublicationNumber() {
    if (this.numberIsAlreadyUsed) {
      return 'auk-form-group--error';
    }
    return null;
  }
}
