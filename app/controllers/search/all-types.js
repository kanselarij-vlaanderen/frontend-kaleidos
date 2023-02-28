import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class AllTypesController extends Controller {
  @service router;
  @service intl;

  queryParams = [
    {
      sort: {
        type: 'string',
      },
    },
  ];

  sortOptions = [
    { value: '-session-dates', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked sort;

  constructor() {
    super(...arguments);
    this.sort = this.sortOptions[1].value;
  }

  get emptySearch() {
    return isEmpty(this.searchText);
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
  navigateToCase(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }

  getStringProp = (object, propName) => {
    if (object) {
      return object[propName];
    }
  }
}
