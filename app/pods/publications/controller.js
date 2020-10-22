import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsController extends Controller {
  @tracked
  isShowingPublicationModal = false;
  @tracked
  hasError = false;
  @tracked
  publication = {
    number: null,
    shortTitle: null,
    longTitle: null,
  };

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

  get getError() {
    return this.hasError;
  }

  get getClassForGroupNumber() {
    if (this.hasError && (!this.publication.number || this.publication.number < 1)) {
      return 'au2-form-group--error';
    }
    return null;
  }

  get getClassForGroupShortTitle() {
    if (this.hasError && (!this.publication.shortTitle || this.publication.shortTitle < 1)) {
      return 'au2-form-group--error';
    }
    return null;
  }


  @action
  createNewPublication() {
    if (!this.publication.number || this.publication.number.length < 1 || !this.publication.shortTitle || this.publication.shortTitle.length < 1) {
      this.hasError = true;
    } else {
      this.hasError = false;
    }

    if (!this.hasError) {
      // create new publication
    }
  }

  @action
  closePublicationModal() {
    this.isShowingPublicationModal = false;
  }

  @action
  showNewPublicationModal() {
    this.isShowingPublicationModal = true;
  }
}
