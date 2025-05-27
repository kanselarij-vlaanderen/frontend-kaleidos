import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesSubmissionsConceptsController extends Controller {
  @service currentSession;
  @service router;

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
      sortSubmissions: {
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
      submissionFilter: {
        type: 'string',
      },
    }
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sortSubmissions = '-created';
  @tracked dateFrom = null;
  @tracked dateTo = null;
  @tracked isLoadingModel;
  @tracked hasToggleableFilters = false;
  @tracked filtersOpen = false;
  @tracked submissionFilter = null;

  constructor() {
    super(...arguments);
    window.addEventListener('resize', () => debounce(this, this.updateToggleableFilters, 150));
    this.updateToggleableFilters();
    this.submissionFilter = null;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('resize', this.updateToggleableFilters);
  }

  @action
  updateToggleableFilters() {
    this.hasToggleableFilters = (window.innerWidth < 768) ? true : false;
  }

  @action
  onToggleFilters(open) {
    this.filtersOpen = open;
  }

  setSubmissionFilter = (value) => (this.submissionFilter = value);

  selectSize = (size) => (this.size = size);
  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  setDateFrom = (date) => (this.dateFrom = formatDate(date));
  setDateTo = (date) => (this.dateTo = formatDate(date));

  navigateToSubmission = (submission) => {
    this.router.transitionTo(
      'cases.submissions.submission',
      submission.id
    );
  }
}
