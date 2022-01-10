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
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  @action
  async savePublicationStatus(statusInformation) {
    if (statusInformation.status.isWithdrawn) {
      this.showConfirmWithdraw = true;
    } else {
      await this.setPublicationStatus(statusInformation.status,statusInformation.changeDate);
    }
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
  openStatusSelector() {
    this.showStatusSelector = true;
  }

  @action
  closeStatusSelector() {
    this.showStatusSelector = false;
  }

  async setPublicationStatus(status, date) {
    if (isEmpty(date)) {
      date = new Date();
    }

    // update status
    this.args.publicationFlow.status = status;

    // update closing dates of auxiliary activities if status is "published"
    if (status.isFinal) {
      this.args.publicationFlow.closingDate = new Date();

      const translationSubcase = await this.args.publicationFlow.translationSubcase;
      if (!translationSubcase.endDate) {
        translationSubcase.endDate = new Date();
        await translationSubcase.save();
      }

      const publicationSubcase = await this.args.publicationFlow.publicationSubcase;
      if (!publicationSubcase.endDate) {
        publicationSubcase.endDate = new Date();
        await publicationSubcase.save();
      }

      // create decision for publication activity when status changed to "published"
      if (status.isPublished && !this.decision) {
        const publicationActivities = await publicationSubcase.publicationActivities;

        if (publicationActivities.length) {
          const publicationActivity = publicationActivities.objectAt(0);
          this.decision = this.store.createRecord('decision', {
            publicationActivity: publicationActivity,
            publicationDate: date,
          });
          this.decision.save();
        }
      }
    } else {
      this.args.publicationFlow.closingDate = null;
    }

    // remove decision if "published" status is reverted and it's not a Staatsblad resource
    const previousStatus = this.publicationStatus;
    if ((previousStatus.isPublished && !status.isPublished)
             && (this.decision && !this.decision.isStaatsbladResource)) {
      await this.decision.destroyRecord();
    }

    // update status-change activity
    const oldChangeActivity = await this.args.publicationFlow.publicationStatusChange;
    if (oldChangeActivity) {
      await oldChangeActivity.destroyRecord();
    }
    const newChangeActivity = this.store.createRecord('publication-status-change', {
      startedAt: date,
      publication: this.args.publicationFlow,
    });
    await newChangeActivity.save();

    await this.args.publicationFlow.save();
    this.loadStatus.perform();
    this.closeStatusSelector();
  }
}
