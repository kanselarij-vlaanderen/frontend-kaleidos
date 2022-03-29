/* eslint-disable class-methods-use-this */
import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SearchController extends Controller {
  queryParams = {
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
    date: {
      type: 'string',
    },
  };

  @service router;

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;
  @tracked date;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;
  @tracked dateBuffer;
  @tracked popoverShown; // TODO, this is for a tooltip, this should be handled elsewhere

  get isSearchingPublicationFlows() {
    return this.router.currentRouteName === 'search.publication-flows';
  }

  deserializeDate(date) {
    return date && moment(date, 'DD-MM-YYYY').toDate();
  }

  serializeDate(date) {
    return date && moment(date).format('DD-MM-YYYY');
  }

  @action
  openPopover() {
    this.popoverShown = true;
  }

  @action
  closePopover() { // TODO, this is for a tooltip, this should be handled elsewhere
    this.popoverShown = false;
  }

  @action
  search() {
    this.searchText = this.searchTextBuffer;
    this.mandatees = this.mandateesBuffer;
    if (this.isSearchingPublicationFlows) {
      this.date = this.serializeDate(this.dateBuffer);
    } else {
      this.dateFrom = this.serializeDate(this.dateFromBuffer);
      this.dateTo = this.serializeDate(this.dateToBuffer);
    }
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }
}
