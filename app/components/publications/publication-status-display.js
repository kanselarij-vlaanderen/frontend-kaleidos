import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty} from '@ember/utils';
export default class PublicationStatusDisplay extends Component {
  @service store;

  @tracked decision;
  @tracked publicationStatus;
  @tracked publicationStatusChange;

  @tracked showStatusSelector = false;
  @tracked showConfirmWithdraw = false;

  constructor() {
    super(...arguments);
    this.loadDecision.perform();
    this.loadStatus.perform();
    this.loadStatusChange.perform();
  }

  @task
  *loadDecision() {
    const publicationSubcase = yield this.args.publicationFlow.publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @task
  *loadStatusChange() {
    this.publicationStatusChange = yield this.args.publicationFlow.publicationStatusChange;
  }
  @task
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
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
    const oldStatus = await this.args.publicationFlow.status;
    const publicationSubcase = await this.args.publicationFlow.publicationSubcase;

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
    else if ((oldStatus.isPublished && !status.isPublished) && (this.decision && !this.decision.isStaatsbladResource)) {
      // only remove decision when it is not a staatsblad resource
      this.decision.deleteRecord();
      this.decision.save();
    }

    // update status
    this.args.publicationFlow.status = status;

    // update closing dates of auxiliary activities
    const translationSubcase = await this.args.publicationFlow.translationSubcase;

    if (status.isPublished || status.isWithdrawn) {
      this.args.publicationFlow.closingDate = new Date();

      if (!translationSubcase.endDate) {
        translationSubcase.endDate = new Date();
        await translationSubcase.save();
      }
      if (!publicationSubcase.endDate) {
        publicationSubcase.endDate = new Date();
        await publicationSubcase.save();
      }
    } else {
      this.args.publicationFlow.closingDate = null;
    }

    // update status-change
    this.publicationStatusChange.startedAt = date;
    await this.publicationStatusChange.save();

    await this.args.publicationFlow.save();
    this.loadStatus.perform();
    this.loadStatusChange.perform();
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
