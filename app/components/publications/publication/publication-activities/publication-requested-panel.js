import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument {requestActivity}
 * @argument {onDeleteRequest}
 */
export default class PublicationsPublicationPublicationActivitiesPublicationRequestedPanel extends Component {
  @tracked isOpenConfirmDeleteAlert = false;

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
    yield this.args.onDeleteRequest();
    this.closeConfirmDeleteAlert();
  }
}
