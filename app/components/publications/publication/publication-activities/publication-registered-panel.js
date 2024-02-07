import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class PublicationsPublicationPublicationActivitiesPublicationRegisteredPanel extends Component {
  @tracked decisions = [];
  @tracked isOpenConfirmDeleteAlert = false;
  @tracked isOpenPublicationEditModal = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const decisions = yield this.args.publicationActivity.decisions;
    this.decisions = decisions.slice();
  }

  get latestDecision() {
    return this.decisions.sortBy('publicationDate').lastObject;
  }

  get isEditDisabled() {
    // Should only be displayed when publication activity has ended
    // and it should not occur that decisions have a different value
    // for isStaatsbladResource but extra checking does not hurt
    return (
      !this.args.publicationActivity.isFinished ||
      this.decisions.some((it) => it.isStaatsbladResource)
    );
  }

  @task
  *editPublication(data) {
    yield this.args.onEditPublicationActivity({
      decision: this.latestDecision,
      publicationDate: data.publicationDate,
    });
    this.closePublicationEditModal();
  }

  @action
  openPublicationEditModal() {
    this.isOpenPublicationEditModal = true;
  }

  @action
  closePublicationEditModal() {
    this.isOpenPublicationEditModal = false;
  }
}
