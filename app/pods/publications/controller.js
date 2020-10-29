import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsController extends Controller {
  @service publicationService;

  @tracked isShowingPublicationModal = false; // createPublicationModal ? more accurate
  @tracked hasError = false;
  @tracked isCreatingPublication = false;

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
      return 'auk-form-group--error';
    }
    return null;
  }

  get getClassForGroupShortTitle() {
    if (this.hasError && (!this.publication.shortTitle || this.publication.shortTitle < 1)) {
      return 'auk-form-group--error';
    }
    return null;
  }

  @action
  async createNewPublication() {
    if (!this.publication.number || this.publication.number.length < 1 || !this.publication.shortTitle || this.publication.shortTitle.length < 1) {
      this.hasError = true;
    } else {
      this.hasError = false;
    }

    if (!this.hasError) {
      this.isCreatingPublication = true;
      await this.publicationService.createNewPublication(this.publication.number, this.publication.longTitle, this.publication.shortTitle);
      this.isShowingPublicationModal = false;
      this.isCreatingPublication = false;
      this.publication = { // TODO
        number: null,
        shortTitle: null,
        longTitle: null,
      };
    }
  }

  @action
  closePublicationModal() {
    this.publication = {
      number: null,
      shortTitle: null,
      longTitle: null,
    };
    this.isShowingPublicationModal = false;
    this.hasError = false;
  }

  @action
  showNewPublicationModal() {
    this.isShowingPublicationModal = true;
  }
}
