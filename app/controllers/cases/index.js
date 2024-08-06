import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

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
  @tracked filtersOpen = false;

  constructor() {
    super(...arguments);
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
  onToggleFilters(open) {
    this.filtersOpen = open;
  }

  get mayShowSubmissionsTab() {
    return isEnabledCabinetSubmissions();
  }

  setCaseFilter = (value) => (this.caseFilter = value);

  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  setDateFrom = (date) => (this.dateFrom = formatDate(date));
  setDateTo = (date) => (this.dateTo = formatDate(date));
}
