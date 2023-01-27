import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CasesSearchController extends Controller {
  @service router;
  @service intl;

  queryParams =[{
    includeArchived: {
      type: 'boolean',
    },
    decisionsOnly: {
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
  }];

  sizeOptions = [5, 10, 20, 50, 100, 200];
  sortOptions = [
    { value: '-session-dates', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked includeArchived;
  @tracked decisionsOnly;
  @tracked emptySearch;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = this.sortOptions[0].value;
    this.includeArchived = false;
    this.decisionsOnly = false;
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  selectSort(event) {
    this.sort = event.target.value;
  }

  @action
  toggleDecisionsOnly() {
    this.decisionsOnly = !this.decisionsOnly;
  }

  @action
  toggleIncludeArchived() {
    this.includeArchived = !this.includeArchived;
  }

  @action
  navigateToCase(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }
}
