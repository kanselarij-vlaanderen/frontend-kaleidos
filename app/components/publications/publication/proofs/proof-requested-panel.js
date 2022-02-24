import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {requestActivity}
 * @argument {onDeleteRequest}
 */
export default class PublicationsPublicationProofProofRequestedPanel extends Component {
  @tracked isVerifyingDelete = false;
  @tracked isDeletingRequest = false;
  @tracked proofingActivity;

  constructor() {
    super(...arguments);
    this.loadProofingActivity.perform();
  }

  get isProofingActivityFinished() {
    return !isEmpty(this.proofingActivity.endDate);
  }

  @task
  *loadProofingActivity() {
    this.proofingActivity = yield this.args.requestActivity.proofingActivity;
  }

  @action
  showDeleteRequest() {
    this.isVerifyingDelete = true;
  }

  @action
  cancelDeleteRequest() {
    this.isVerifyingDelete = false;
  }

  @action
  async deleteRequest() {
    this.isDeletingRequest = true;
    await this.args.onDeleteRequest();
    this.isVerifyingDelete = false;
    this.isDeletingRequest = false;
  }
}
