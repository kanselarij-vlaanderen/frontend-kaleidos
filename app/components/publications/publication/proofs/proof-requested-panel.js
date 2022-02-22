import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {requestActivity}
 */
export default class PublicationsPublicationProofProofRequestedPanel extends Component {
  @tracked isVerifyingDelete = false;
  @tracked proofingActivity;

  constructor() {
    super(...arguments);
    this.loadProofingActivity.perform();
  }

  get isTranslationActivityFinished() {
    return !isEmpty(this.proofingActivity.endDate);
  }

  @task
  *loadTranslationActivity() {
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
    await this.args.onDeleteRequest();
    this.isVerifyingDelete = false;
  }
}
