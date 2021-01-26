import Controller from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsIndexController extends Controller {
  @tracked filterTableColumnOptionKeys = JSON.parse(localStorage.getItem('filterTableColumnOptionKeys'))
    || {
      caseNameFilterOption: false,
      publicationNumberFilterOption: false,
      derivedPublicationTypeFilterOption: false,
      onMeetingFilterOption: false,
      longTitleFilterOption: false,
      requestedPublicationDateFilterOption: false,
      finalPublicationDateFilterOption: false,
      publicationDateFilterOption: false,
      numacNuberBsFilterOption: false,
      caseManagerFilterOption: false,
      lastEditedFilterOption: false,
      lastEditedByFilterOption: false,
      withdrawnDateFilterOption: false,
      pauseDateFilterOption: false,
      translateRequestsFilterOption: false,
      signRequestsFilterOption: false,
      publishPreviewRequestsFilterOption: false,
      speedProcedureFilterOption: false,
      commentFilterOption: false,
      fromDesignAgendaFilterOption: false,
    };

  @tracked showFilterTableModal = false;
  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);

  @tracked page = 0;
  @tracked size = 5;
  @tracked sort = '-created';

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  filterTables() {
    this.showFilterTableModal = true;
  }

  @action
  closeFilterTableModal() {
    localStorage.setItem('filterTableColumnOptionKeys', JSON.stringify(this.filterTableColumnOptionKeys));
    this.showFilterTableModal = false;
  }

  @action
  toggleFilterOption(event) {
    const tempArr = this.get('filterTableColumnOptionKeys');
    set(tempArr, event.target.name, !tempArr[event.target.name]);
    this.set('filterTableColumnOptionKeys', tempArr);
  }
}
