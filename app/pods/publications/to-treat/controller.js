import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ToTreatController extends Controller {
  queryParams =[{
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    searchText: {
      type: 'string',
    },
  }];

  @service publicationService;
  @tracked searchText = '';
  @tracked searchTextBuffer = '';
  @tracked page = 0;
  @tracked size = 25;

  @tracked showLoader = false;
  @tracked isLoading = false;

  @action
  caseHasPublication() {
    return false;
  }

  @action
  caseGetPublicationId() {
    return 1;
  }

  @action
  search() {
    this.searchText = this.searchTextBuffer;
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.performSearch(this.searchText);
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
    this.performSearch(this.searchText);
  }

  @action
  // eslint-disable-next-line no-unused-vars
  async startPublication(_case) {
    this.set('showLoader', true);
    // TODO what publication number to start with here?
    // Defaulted to 0.
    const newPublication = await this.publicationService.createNewPublication(0, _case.id);
    this.set('showLoader', false);
    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }
}
