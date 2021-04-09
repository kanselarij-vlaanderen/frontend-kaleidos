import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class PublicationsController extends Controller {
  @service('-routing') routing;
  @tracked isShowPublicationModal = false;
  @tracked showLoader = false;
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

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
    const newPublication = await this.createNewPublication(publication.number, publication.suffix, publication.longTitle, publication.shortTitle);
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

  async createNewPublication(publicationNumber, publicationSuffix, title, shortTitle) {
    const creationDatetime = new Date().getTime();
    const caze = this.store.createRecord('case', {
      title,
      shortTitle,
      created: creationDatetime,
    });
    await caze.save();

    const toPublishStatus = (await this.store.query('publication-status',  {
      'filter[:id:]': CONFIG.publicationStatusToPublish.id,
    })).firstObject;

    const publicationFlow = this.store.createRecord('publication-flow', {
      publicationNumber,
      publicationSuffix,
      case: caze,
      created: creationDatetime,
      status: toPublishStatus,
      modified: creationDatetime,
    });
    await publicationFlow.save();
    return publicationFlow;
  }
}
