import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {requestActivity}
 * @argument {onDeleteRequest}
 */
export default class PublicationsPublicationProofProofRequestedPanel extends Component {
  @tracked isVerifyingDelete = false;
  @tracked isDeletingRequest = false;
  @tracked proofingActivity;

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
