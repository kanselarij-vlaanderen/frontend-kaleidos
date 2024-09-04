import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SubcaseDetailRegular extends Component {
  @service store;
  @service currentSession;
  @service subcaseService;

  @tracked hideAccessLevel = false;
  @tracked latestDecisionActivity;
  @tracked isOpenBatchDetailsModal = false;
  constructor() {
    super(...arguments);
    this.loadLatestDecisionActivity.perform();
  }

  @task
  *loadLatestDecisionActivity() {
    this.latestDecisionActivity = yield this.subcaseService.getLatestDecisionActivity(this.args.subcase);
    if (this.latestDecisionActivity &&
      ((this.latestDecisionActivity.isRetracted || this.latestDecisionActivity.isPostponed) &&
      !this.currentSession.may('view-access-level-pill-when-postponed'))) {
      this.hideAccessLevel = true;
    }
  }

  @action
  openBatchDetails() {
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.args.refresh?.();
    this.isOpenBatchDetailsModal = false;
  }
}
