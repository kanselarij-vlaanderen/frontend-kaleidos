import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationTimelineEvent extends Component {
  @tracked isOpenConfirmDeleteAlert = false;
  @tracked publicationActivity;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    let decisions = yield this.args.publicationActivity.decisions;
    this.decisions = decisions.toArray();
  }

  get isEditDisabled() {
    // Should only be displayed when publication activity has ended
    // and it should not occur that decisions have a different value for isStaatsbladResource
    // but extra checking does not hurt
    return (
      this.args.publicationActivity.endDate === undefined ||
      this.decisions.some((it) => it.isStaatsbladResource)
    );
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
