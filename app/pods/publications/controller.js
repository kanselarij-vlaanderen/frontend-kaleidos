import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import search from 'fe-redpencil/utils/mu-search';

export default class PublicationsController extends Controller {
  @service publicationService;
  @service('-routing') routing;

  @tracked isShowingPublicationModal = false; // createPublicationModal ? more accurate
  @tracked hasError = false;
  @tracked numberIsAlreadyUsed = false;
  @tracked isCreatingPublication = false;
  @tracked searchText;
  @tracked showSearchResults = false;
  @tracked searchResults;
  @tracked showLoader = false;

  @tracked
  publication = {
    number: null,
    shortTitle: null,
    longTitle: null,
  };

  @restartableTask
  *debouncedSearchTask(event) {
    this.searchText = event.target.value;
    yield timeout(500);
    yield this.search(this.searchText);
  }

  @action
  async search() {
    const filter = {};
    if (this.searchText.length === 0 || this.searchText === '') {
      filter[':sqs:title'] = '*'; // search without filter
      this.showSearchResults = false;
    } else {
      this.textSearchFields = ['title', 'publicationFlowNumber', 'publicationFlowRemark', 'shortTitle', 'subcaseTitle'];
      const searchModifier = ':sqs:';
      const textSearchKey = this.textSearchFields.join(',');
      filter[`${searchModifier}${textSearchKey}`] = this.searchText;
      this.showSearchResults = true;
    }

    this.searchResults = await search('cases', 0, 10, null, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
    if (this.searchResults.length === 0) {
      this.searchResults = false;
    }
  }

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

  get shouldShowPublicationHeader() {
    return !this.routing.currentRouteName.startsWith('publications.publication');
  }

  @action
  async startPublicationFromCaseId(_caseId) {
    this.showLoader = true;
    const newPublication = await this.publicationService.createNewPublication(0, _caseId);
    this.showLoader = false;
    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }

  @action
  async isPublicationNumberAlreadyTaken() {
    const isPublicationNumberTaken = await this.publicationService.publicationNumberAlreadyTaken(this.publication.number);
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
      const newPublication = await this.publicationService.createNewPublication(this.publication.number, false, this.publication.longTitle, this.publication.shortTitle);
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

  async resetPublication() {
    this.publication = {
      number: null,
      shortTitle: null,
      longTitle: null,
    };
    this.hasError = false;
  }
}
