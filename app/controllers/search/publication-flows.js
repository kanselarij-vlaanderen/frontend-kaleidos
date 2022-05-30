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
  @tracked isSelectedAllRegulationTypes = false;
  @tracked isSelectedAllStatuses = false;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-opening-date';
  }

  get allRegulationTypeIds() {
    return this.regulationTypes.map((type) => type.id);
  }

  get allPublicationStatusIds() {
    return this.publicationStatuses.map((status) => status.id);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  toggleIsSelectedAllRegulationTypes() {
    this.isSelectedAllRegulationTypes = !this.isSelectedAllRegulationTypes;

    if (this.isSelectedAllRegulationTypes) {
      this.regulationTypeIds = this.allRegulationTypeIds;
    } else {
      this.regulationTypeIds = [];
    }
  }

  @action
  toggleRegulationType(regulationType, event) {
    const checked = event.target.checked;
    if (checked) {
      this.regulationTypeIds.push(regulationType.id);
    } else {
      this.regulationTypeIds.splice(this.regulationTypeIds.indexOf(regulationType.id), 1);
    }
    // At the time of writing, ember query-paramters of the type "array" don't
    // have support for TrackedArray, thus, when assuming we keep the automatic `refreshModel: true`
    // approach, reassigning the array in order to trigger a refresh seems like the way to go.
    this.regulationTypeIds = this.regulationTypeIds; // eslint-disable-line no-self-assign

    this.isSelectedAllRegulationTypes =
      this.regulationTypeIds.length == this.allRegulationTypeIds.length;
  }

  @action
  toggleIsSelectedAllStatuses() {
    this.isSelectedAllStatuses = !this.isSelectedAllStatuses;

    if (this.isSelectedAllStatuses) {
      this.publicationStatusIds = this.allPublicationStatusIds;
    } else {
      this.publicationStatusIds = [];
    }
  }

  @action
  togglePublicationStatus(publicationStatus, event) {
    const checked = event.target.checked;
    if (checked) {
      this.publicationStatusIds.push(publicationStatus.id);
    } else {
      this.publicationStatusIds.splice(this.publicationStatusIds.indexOf(publicationStatus.id), 1);
    }
    // reassign array in order to trigger model refresh
    this.publicationStatusIds = this.publicationStatusIds; // eslint-disable-line no-self-assign

    this.isSelectedAllStatuses =
      this.publicationStatusIds.length == this.allPublicationStatusIds.length;
  }

  @action
  navigateToPublicationFlow(publicationFlow) {
    this.router.transitionTo('publications.publication.index', publicationFlow.id);
  }
}
