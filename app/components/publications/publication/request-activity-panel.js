import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument {title}
 * @argument {requestActivity}
 * @argument {isDisabledDelete}
 * @argument {onDeleteRequest}
 */
export default class PublicationsPublicationRequestActivityPanel extends Component {
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
