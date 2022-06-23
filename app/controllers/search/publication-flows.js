import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublicationFlowSearchController extends Controller {
  @service router;

  queryParams =[{
    regulationTypeIds: {
      type: 'array',
    },
    publicationStatusIds: {
      type: 'array',
    },
    urgencyLevelIds: {
      type: 'array',
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
  }];

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked regulationTypeIds = [];
  @tracked publicationStatusIds = [];
  @tracked urgencyLevelIds = [];

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-opening-date';
  }

  get selectedRegulationTypes() {
    return this.regulationTypeIds.map((typeId) => this.regulationTypes.find(type => type.id === typeId));
  }

  get selectedPublicationStatuses() {
    return this.publicationStatusIds.map((statusId) => this.publicationStatuses.find(status => status.id === statusId));
  }

  get selectedUrgencyLevels() {
    return this.urgencyLevelIds.map((urgencyLevelId) => this.urgencyLevels.find(urgency => urgency.id === urgencyLevelId));
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
  updateSelectedUrgencyLevels(urgencyLevels) {
    this.urgencyLevelIds = urgencyLevels.map(ps => ps.id);
  }

  @action
  navigateToPublicationFlow(publicationFlow) {
    this.router.transitionTo('publications.publication.index', publicationFlow.id);
  }
}
