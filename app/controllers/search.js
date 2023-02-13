import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import formatDate from '../utils/format-date-search-param';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class SearchController extends Controller {
  @service store;

  queryParams = [
    {
      searchText: {
        type: 'string',
      },
      mandatees: {
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

  sizeOptions = [5, 10, 20, 50, 100, 200];

  @tracked searchText = '';
  @tracked mandatees = [];
  @tracked dateFrom;
  @tracked dateTo;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer = [];

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
    this.mandatees = mandatees.map((minister) => minister.id);
    this.mandateesBuffer = mandatees;
  }

  @task
  *loadMinisters() {
    if (this.mandatees) {
      this.mandateesBuffer = (yield Promise.all(
        this.mandatees?.map((id) => this.store.findRecord('person', id))
      )).toArray();
    } else {
      this.mandateesBuffer = [];
    }
  }
}
