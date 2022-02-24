import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';

/**
 * @argument {requestActivity}
 */
export default class PublicationsPublicationTranslationTranslationRequestedPanel extends Component {
  @tracked isVerifyingDelete = false;
  @tracked isDeletingRequest = false;
  @tracked translationActivity;

  constructor() {
    super(...arguments);
    this.loadTranslationActivity.perform();
  }

  get isTranslationActivityFinished() {
    return !isEmpty(this.translationActivity.endDate);
  }

  @task
  *loadTranslationActivity() {
    this.translationActivity = yield this.args.requestActivity.translationActivity;
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
