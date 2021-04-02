import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  // Services.
  @service intl;
  @service media;

  @tracked sidebarIsOpen = this.get('media.isBigScreen');
  @tracked showConfirmWithdraw = false;
  @tracked showLoader = false;

  get casePath() {
    let title = this.intl.t('publication-flow');
    // TODO use publicationNumberToDisplay here, but doesn't seem to update when changing suffix
    if (!this.model.latestSubcaseOnMeeting) {
      title = title.concat(' - ', this.intl.t('not-via-cabinet'), ' - ', this.model.publicationFlow.publicationNumber, ' ', this.model.publicationFlow.publicationSuffix || '');
    } else {
      title = title.concat(' - ', this.intl.t('via-cabinet'), ' - ', this.model.publicationFlow.publicationNumber, ' ', this.model.publicationFlow.publicationSuffix || '');
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

  get documentsCount() {
    return `(${this.model.counts.documentCount})`;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  get showStatusForTranslations() {
    const totalTranslations = this.model.counts.totalTranslations;
    const closedOrWithdrawn = this.model.counts.closedOrWithdrawnTranslationRequests;
    const openTranslation = this.model.counts.openTranslationRequests;

    // Er zijn geen translations aangemaakt.
    if (totalTranslations === 0) {
      return {
        status: 'not-started',
      };
    }

    // Er is 1 open translation, toon enkel de icon
    if (openTranslation === 1 && (totalTranslations === 1)) {
      return {
        status: '',
      };
    }

    // Er zijn nog open statussen
    if (openTranslation !== 0) {
      return {
        value: `${closedOrWithdrawn}/${totalTranslations}`,
      };
    }

    // Alle requests zijn afgehandeld.
    if (totalTranslations === closedOrWithdrawn) {
      return {
        status: 'done',
      };
    }
    return null;
  }

  get showStatusForPublicationPreviews() {
    const totalPublishPreviewRequests = this.model.counts.totalPublishPreviewRequests;
    const closedOrWithdrawnPublishPrevieuwRequests = this.model.counts.closedOrWithdrawnPublishPrevieuwRequests;
    const openPublishPreviewRequests = this.model.counts.openPublishPreviewRequests;

    // Er zijn geen translations aangemaakt.
    if (totalPublishPreviewRequests === 0) {
      return {
        status: 'not-started',
      };
    }

    // Er is 1 open translation en er is maar 1 publishpreview, toon enkel de icon
    if (openPublishPreviewRequests === 1 && (totalPublishPreviewRequests === 1)) {
      return {
        status: '',
      };
    }

    // Er zijn nog open statussen
    if (openPublishPreviewRequests !== 0) {
      return {
        value: `${closedOrWithdrawnPublishPrevieuwRequests}/${totalPublishPreviewRequests}`,
      };
    }

    // Alle requests zijn afgehandeld.
    if (totalPublishPreviewRequests === closedOrWithdrawnPublishPrevieuwRequests) {
      return {
        status: 'done',
      };
    }
    return null;
  }
}
