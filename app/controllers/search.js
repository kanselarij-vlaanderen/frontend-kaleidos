import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import formatDate from '../utils/format-date-search-param';

export default class SearchController extends Controller {
  queryParams = [
    {
      searchText: {
        type: 'string',
      },
      mandatees: {
        type: 'string',
      },
      dateFrom: {
        type: 'string',
      },
      dateTo: {
        type: 'string',
      },
    },
  ];

  sizeOptions = [5, 10, 20, 50, 100, 200];

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;
  @tracked searchTextBuffer = '';

  @action
  search(e) {
    e.preventDefault();
    this.searchText = this.searchTextBuffer;
  }

  @action
  setDateFrom(date) {
    this.dateFrom = formatDate(date);
  }

  @action
  setDateTo(date) {
    this.dateTo = formatDate(date);
  }

  @action
  setMandatees(mandatees) {
    this.mandatees = mandatees;
  }
}
