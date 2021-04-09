import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsController extends Controller {
  @service publicationService;
  @service('-routing') routing;
  @tracked isShowPublicationModal = false;
  @tracked showLoader = false;
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

  @action
  async startPublicationFromCaseId(_caseId) {
    this.showLoader = true;
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, '', _caseId);
    this.showLoader = false;

    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }

  @action
  showPublicationModal() {
    this.isShowPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isShowPublicationModal = false;
  }

  @action
  async saveNewPublication(publication) {
    const newPublication = await this.publicationService.createNewPublication(publication.number, publication.suffix, false, publication.longTitle, publication.shortTitle);
    this.closePublicationModal();
    this.transitionToRoute('publications.publication', newPublication.get('id'));
  }

  @action
  showFilterModal() {
    this.isShowPublicationFilterModal = true;
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

  get shouldShowPublicationHeader() {
    return this.routing.currentRouteName.startsWith('publications.index');
  }
}
