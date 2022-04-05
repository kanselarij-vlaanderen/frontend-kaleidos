/* eslint-disable class-methods-use-this */
import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

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
    publicationDateTypeKey: {
      type: 'string',
    },
  };

  @service router;
  @service currentSession;

  sizeOptions = [5, 10, 20, 50, 100, 200];
  publicationDateTypes = [
    {
      key: 'decisionDate',
      label: 'Datum beslissing',
    },
    {
      key: 'openingDate',
      label: 'Datum ontvangst',
    },
    // translationRequestDate
    {
      key: 'translationDueDate',
      label: 'Limiet vertaling',
    },
    {
      key: 'proofPrintRequestDate',
      label: 'Aanvraag drukproef',
    },
    {
      key: 'proofPrintReceivedDate',
      label: 'Drukproef in',
    },
    {
      key: 'publicationTargetDate',
      label: 'Gevraagde publicatie datum',
    },
    {
      key: 'publicationDate',
      label: 'Publicatie datum',
    },
    {
      key: 'publicationDueDate',
      label: 'Limiet publicatie',
    },
  ];

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;
  @tracked date;
  @tracked publicationDateTypeKey = this.publicationDateTypes[0]?.key;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;
  @tracked dateBuffer;
  @tracked publicationDateTypeKeyBuffer = this.publicationDateTypeKey;
  @tracked popoverShown; // TODO, this is for a tooltip, this should be handled elsewhere

  get isShownPublicationFlows() {
    const isEnabled = isEmpty(ENV.APP.ENABLED_PUBLICATIONS_TAB);
    const maySearch = this.currentSession.may('search-publication-flows');
    return isEnabled && maySearch;
  }

  get isSearchingPublicationFlows() {
    return this.router.currentRouteName === 'search.publication-flows';
  }

  @action
  selectPublicationDateType(event) {
    this.publicationDateTypeKeyBuffer = event.target.value;
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
      this.publicationDateTypeKey = this.publicationDateTypeKeyBuffer;
    } else {
      this.dateFrom = this.serializeDate(this.dateFromBuffer);
      this.dateTo = this.serializeDate(this.dateToBuffer);
    }
  }
}
