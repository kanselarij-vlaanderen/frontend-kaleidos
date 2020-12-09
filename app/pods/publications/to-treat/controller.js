import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ToTreatController extends Controller {
  queryParams = [{
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
  async startPublication(_case) {
    this.showLoader = true;
    // Test if dossier already had publication (index not up to date).
    const pubFlows = await this.store.query('publication-flow', {
      filter: {
        case: {
          id: _case.id,
        },
      },
    });
    let newPublication;
    if (pubFlows.content.length > 0) {
      newPublication = await this.store.findRecord('publication-flow', pubFlows.content[0].id);
    } else {
      newPublication = await this.publicationService.createNewPublication(0, _case.id);
      this.showLoader = false;
    }
    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }
}
