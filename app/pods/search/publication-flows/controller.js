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

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-opening-date';
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  updateRegulationTypeIds(regulationTypeIds) {
    this.regulationTypeIds = regulationTypeIds;
  }

  @action
  updatePublicationStatus(publicationStatusIds) {
    this.publicationStatusIds = publicationStatusIds;
  }

  @action
  navigateToPublicationFlow(publicationFlow) {
    this.router.transitionTo('publications.publication.index', publicationFlow.id);
  }
}
