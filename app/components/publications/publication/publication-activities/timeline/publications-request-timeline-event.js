import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsRequestTimelineEvent extends Component {
  @tracked isOpenConfirmDeleteAlert = false;
  @tracked publicationActivity;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.publicationActivity = yield this.args.requestActivity
      .publicationActivity;
  }

  get isDeleteDisabled() {
    return this.publicationActivity.endDate !== undefined;
  }

  @action
  openConfirmDeleteAlert() {
    this.isOpenConfirmDeleteAlert = true;
  }

  @action
  closeConfirmDeleteAlert() {
    this.isOpenConfirmDeleteAlert = false;
  }

  @task
  *delete() {
    yield this.args.onDelete(this.args.requestActivity);
    this.isOpenConfirmDeleteAlert = false;
  }
}
