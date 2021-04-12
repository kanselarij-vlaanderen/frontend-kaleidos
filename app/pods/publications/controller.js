import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsController extends Controller {
  @service publicationService;
  @service('-routing') routing;
  @tracked isShowingPublicationModal = false; // createPublicationModal ? more accurate
  @tracked hasError = false;
  @tracked numberIsAlreadyUsed = false;
  @tracked isCreatingPublication = false;
  @tracked showLoader = false;
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

  @tracked
  publication = {
    number: null,
    suffix: null,
    shortTitle: null,
    longTitle: null,
  };


  get getError() {
    return this.hasError;
  }

  get getClassForGroupNumber() {
    if (this.numberIsAlreadyUsed || (this.hasError && (!this.publication.number || this.publication.number < 1))) {
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
  async startPublicationFromCaseId(_caseId) {
    this.showLoader = true;
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, '', _caseId);
    this.showLoader = false;
    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }

  @action
  async isPublicationNumberAlreadyTaken() {
    const isPublicationNumberTaken = await this.publicationService.publicationNumberAlreadyTaken(this.publication.number, this.publication.suffix);
    if (isPublicationNumberTaken) {
      this.numberIsAlreadyUsed = true;
    } else {
      this.numberIsAlreadyUsed = false;
    }
  }

  @action
  async createNewPublication() {
    if (this.numberIsAlreadyUsed || !this.publication.number || this.publication.number.length < 1 || !this.publication.shortTitle || this.publication.shortTitle.length < 1) {
      this.hasError = true;
    } else {
      this.hasError = false;
    }

    if (!this.hasError) {
      this.isCreatingPublication = true;
      const newPublication = await this.publicationService.createNewPublication(this.publication.number, this.publication.suffix, false, this.publication.longTitle, this.publication.shortTitle);
      this.closePublicationModal();
      this.transitionToRoute('publications.publication', newPublication.get('id'));
    }
  }

  @action
  closePublicationModal() {
    this.isShowingPublicationModal = false;
    this.isCreatingPublication = false;
    this.resetPublication();
  }

  @action
  async showNewPublicationModal() {
    this.isShowingPublicationModal = true;
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    this.set('publication.number', newPublicationNumber);
  }

  @action
  showFilterModal() {
    this.isShowPublicationFilterModal = true;
  }

  get shouldShowPublicationHeader() {
    return this.routing.currentRouteName.startsWith('publications.index');
  }

  resetPublication() {
    this.publication = {
      number: null,
      shortTitle: null,
      longTitle: null,
    };
    this.hasError = false;
  }

  @action
  cancelPublicationsFilter() {
    this.isShowPublicationFilterModal = false;
  }

  @action
  savePublicationsFilter(publicationFilter) {
    this.publicationFilter = publicationFilter;
    localStorage.setItem('publicationFilter', this.publicationFilter.toString());
    this.isShowPublicationFilterModal = false;
    this.send('refreshModel');
  }
}
