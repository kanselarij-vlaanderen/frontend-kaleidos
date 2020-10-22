import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsController extends Controller {
  @tracked
  isShowingPublicationModal = false;

  get amountInProgress() {
    if (this.model) {
      return this.model.filter((publication) => publication.inProgress).length;
    }

    return 0;
  }

  get amountDone() {
    if (this.model) {
      return this.model.filter((publication) => !publication.inProgress).length;
    }

    return 0;
  }

  @action
  hidePublicationModal() {
    this.isShowingPublicationModal = false;
  }

  @action
  showNewPublicationModal() {
    this.isShowingPublicationModal = true;
  }
}
