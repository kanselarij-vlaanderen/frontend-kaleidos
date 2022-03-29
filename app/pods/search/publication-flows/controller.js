import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationFlowSearchController extends Controller {
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
  @tracked status;
  // @tracked emptySearch;

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
  toggleRegulationType(regulationType, event) {
    const checked = event.target.checked;
    if (checked) {
      this.regulationTypeIds.push(regulationType.id);
    } else {
      this.regulationTypeIds.splice(this.regulationTypeIds.indexOf(regulationType.id), 1);
    }
    this.regulationTypeIds = this.regulationTypeIds;
  }

  @action
  togglePublicationStatus(publicationStatus, event) {
    const checked = event.target.checked;
    debugger
    if (checked) {
      this.publicationStatusIds.push(publicationStatus.id);
    } else {
      this.publicationStatusIds.splice(this.publicationStatusIds.indexOf(publicationStatus.id), 1);
    }
    this.publicationStatusIds = this.publicationStatusIds;
  }

  @action
  navigateToPublicationFlow(publicationFlow) {
    this.transitionToRoute('publications.publication.index', publicationFlow.id);
  }
}
