import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  queryParams = {
    searchText: { type: 'string'},
    mandatees: { type: 'string'},
    dateFrom: { type: 'string'},
    dateTo: { type: 'string'}
  };

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;

  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;

  deserializeDate (date) {
    return date && moment(date, "DD-MM-YYYY").toDate();
  }
  serializeDate (date) {
    return date && moment(date).format('DD-MM-YYYY');
  }

  @action
  openPopover () { // TODO, this is for a tooltip, this should be handled elsewhere
    this.popoverShown = true;
  }

  @action
  closePopover () { // TODO, this is for a tooltip, this should be handled elsewhere
    this.popoverShown = false;
  }

  @action
  search () {
    this.searchText = this.searchTextBuffer;
    this.mandatees = this.mandateesBuffer;
    this.dateFrom = this.serializeDate(this.dateFromBuffer);
    this.dateTo = this.serializeDate(this.dateToBuffer);
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }
}
