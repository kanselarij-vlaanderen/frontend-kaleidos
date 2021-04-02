import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsController extends Controller {
  @service publicationService;
  @service('-routing') routing;
  @tracked isShowPublicationModal = false;
  @tracked numberIsAlreadyUsed = false;
  @tracked isCreatingPublication = false;
  @tracked showLoader = false;
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

  @action
  async startPublicationFromCaseId(_caseId) {
    this.showLoader = true;
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, '', _caseId);

    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
    this.showLoader = false;
  }

  @action
  async isPublicationNumberAlreadyTaken(publication) {
    return await this.publicationService.publicationNumberAlreadyTaken(publication.number, publication.suffix);
  }

  @action
  async createNewPublication(publication) {
    this.isCreatingPublication = true;
    const newPublication = await this.publicationService.createNewPublication(publication.number, publication.suffix, false, publication.longTitle, publication.shortTitle);
    this.closePublicationModal();
    this.transitionToRoute('publications.publication', newPublication.get('id'));
  }

  @action
  closePublicationModal() {
    this.isShowPublicationModal = false;
    this.isCreatingPublication = false;
  }

  @action
  async showPublicationModal() {
    this.isShowPublicationModal = true;
  }

  @action
  async getPublicationNumber() {
    const publicationNumber = await this.publicationService.getNewPublicationNextNumber();
    return publicationNumber;
  }

  @action
  showFilterModal() {
    this.isShowPublicationFilterModal = true;
  }

  get shouldShowPublicationHeader() {
    return this.routing.currentRouteName.startsWith('publications.index');
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
