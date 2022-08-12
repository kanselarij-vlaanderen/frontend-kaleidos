import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewSearchController extends Controller {
  @service router;
  @service currentSession;

  queryParams = {
    searchText: {
      type: 'string',
    },
    dateFrom: {
      type: 'string',
    },
    dateTo: {
      type: 'string',
    },
    publicationDateTypeKey: {
      type: 'string',
    },
    regulationTypeIds: {
      type: 'array',
    },
    publicationStatusIds: {
      type: 'array',
    },
    urgentOnly: {
      type: 'boolean',
    },
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

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

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
  @tracked publicationDateTypeKey = this.publicationDateTypes[0]?.key;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;
  @tracked publicationDateTypeKeyBuffer = this.publicationDateTypeKey;
  @tracked popoverShown; // TODO, this is for a tooltip, this should be handled elsewhere
  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked regulationTypeIds = [];
  @tracked publicationStatusIds = [];
  @tracked urgentOnly;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-opening-date';
    this.urgentOnly = false;
  }

  get isShownPublicationFlows() {
    return this.currentSession.may('search-publication-flows');
  }

  get selectedRegulationTypes() {
    return this.regulationTypeIds.map((typeId) => this.regulationTypes.find(type => type.id === typeId));
  }

  get selectedPublicationStatuses() {
    return this.publicationStatusIds.map((statusId) => this.publicationStatuses.find(status => status.id === statusId));
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
    this.publicationDateTypeKey = this.publicationDateTypeKeyBuffer;
    this.dateFrom = this.serializeDate(this.dateFromBuffer);
    this.dateTo = this.serializeDate(this.dateToBuffer);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  updateSelectedRegulationTypes(regulationTypes) {
    this.regulationTypeIds = regulationTypes.map(rt => rt.id);
  }

  @action
  updateSelectedPublicationStatuses(publicationStatuses) {
    this.publicationStatusIds = publicationStatuses.map(ps => ps.id);
  }

  @action
  toggleUrgentOnly() {
    this.urgentOnly = !this.urgentOnly;
  }

  @action
  navigateToPublicationFlow(publicationFlow) {
    this.router.transitionTo('publications.publication.index', publicationFlow.id);
  }
}
