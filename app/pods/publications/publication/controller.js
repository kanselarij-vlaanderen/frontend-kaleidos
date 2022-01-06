import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty} from '@ember/utils';

export default class PublicationController extends Controller {
  @service media;
  @service intl;
  @service toaster;

  @tracked sidebarIsOpen = this.media.get('isBigScreen');

  @tracked decision;
  @tracked publicationStatus;
  @tracked publicationStatusChange;

  @tracked showStatusSelector = false;
  @tracked showConfirmWithdraw = false;


  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @action
  openStatusSelector() {
    this.showStatusSelector = true;
  }

  @action
  closeStatusSelector() {
    this.showStatusSelector = false;
  }

  @action
  async withdrawPublicationFlow() {
    const withdrawn = await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN);
    await this.setPublicationStatus(withdrawn);
    this.showConfirmWithdraw = false;
  }

  @action
  cancelWithdraw() {
    this.showConfirmWithdraw = false;
  }

  @action
  async setPublicationStatus(status,date) {
    if (isEmpty(date)) {
      date = new Date();
    }
    const oldStatus = await this.model.status;
    const publicationSubcase = await this.model.publicationSubcase;

    // create publication when status changed to "published"
    if (status.isPublished && !this.decision) {
      const publicationActivities = await publicationSubcase.publicationActivities;

      if (publicationActivities.length) {
        const publicationActivity = publicationActivities.objectAt(0);
        this.decision = this.store.createRecord('decision', {
          publicationActivity: publicationActivity,
          publicationDate: new Date(),
        });
        this.decision.save();
      }
    }
    // remove created decision when "published" status is reverted
    else if ((oldStatus.isPublished && !status.isPublished)
      && (this.decision && !this.decision.isStaatsbladResource)
    ) {
      // only remove decision when it is not a staatsblad resource
      this.decision.deleteRecord();
      this.decision.save();
    }

    // update status
    this.model.status = status;

    // update closing dates of auxiliary activities
    const translationSubcase = await this.model.translationSubcase;

    if (status.isPublished || status.isWithdrawn) {
      this.model.closingDate = new Date();

      if (!translationSubcase.endDate) {
        translationSubcase.endDate = new Date();
        await translationSubcase.save();
      }
      if (!publicationSubcase.endDate) {
        publicationSubcase.endDate = new Date();
        await publicationSubcase.save();
      }
    } else {
      this.model.closingDate = null;
    }

    // add a status-change
    const statusChange = this.store.createRecord('publication-status-change', {
      startedAt: date,
      publication: this.model,
    });

    await this.model.save();
    await statusChange.save();
    this.closeStatusSelector();
  }

  @action
  async savePublicationStatus(statusInformation) {
    if (statusInformation.status.isWithdrawn) {
      this.showConfirmWithdraw = true;
    } else {
      await this.setPublicationStatus(statusInformation.status,statusInformation.changeDate);
    }
  }
}
