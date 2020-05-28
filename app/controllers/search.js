import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;

  get dateFrom () {
      return this.dateFromBuffer && moment(this.dateFromBuffer, "DD-MM-YYYY").toDate();
  }
  set dateFrom (value) {
      this.dateFromBuffer = value && moment(value).format('DD-MM-YYYY');
  }

  get dateTo () {
      return this.dateToBuffer && moment(this.dateToBuffer, "DD-MM-YYYY").toDate();
  }
  set dateTo (value) {
      this.dateToBuffer = value && moment(value).format('DD-MM-YYYY');
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
    this.dateFrom = this.dateFromBuffer;
    this.dateTo = this.dateToBuffer;
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }
}
