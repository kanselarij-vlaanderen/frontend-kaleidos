import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';

export default class CasesIndexController extends Controller {
  // Services
  @service router;
  @service store;

  queryParams = [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
    {
      dateFrom: {
        type: 'string',
      },
    },
    {
      dateTo: {
        type: 'string',
      },
    },
    {
      caseFilter: {
        type: 'string',
      },
    },
    {
      submitters: {
        type: 'array',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sort = '-created';
  @tracked dateFrom = null;
  @tracked dateTo = null;
  @tracked submitters = [];
  @tracked caseFilter = null;
  @tracked isLoadingModel;
  @tracked hasToggleableFilters = false;
  @tracked filtersOpen = false;

  constructor() {
    super(...arguments);
    window.addEventListener('resize', () => debounce(this, this.updateToggleableFilters, 150));
    this.updateToggleableFilters();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('resize', this.updateToggleableFilters);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  async navigateToDecisionmakingFlow(case_) {
    const decisionmakingFlow = await case_.decisionmakingFlow;
    this.router.transitionTo(
      'cases.case.index',
      decisionmakingFlow.id
    );
  }

  @action
  updateToggleableFilters() {
    this.hasToggleableFilters = (window.innerWidth < 768) ? true : false;
  }

  @action
  onToggleFilters(open) {
    this.filtersOpen = open;
  }

  setCaseFilter = (value) => (this.caseFilter = value);

  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  setDateFrom = (date) => (this.dateFrom = formatDate(date));
  setDateTo = (date) => (this.dateTo = formatDate(date));
}
