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
        type: 'array',
      },
      governmentAreas: {
        type: 'array',
      },
      dateFrom: {
        type: 'string',
      },
      dateTo: {
        type: 'string',
      },
    },
  ];

  @tracked searchText = '';
  @tracked mandatees = [];
  @tracked dateFrom;
  @tracked dateTo;

  @tracked governmentAreas = [];

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

  @action
  setGovernmentAreas(governmentAreas) {
    this.governmentAreas = governmentAreas;
  }
}
