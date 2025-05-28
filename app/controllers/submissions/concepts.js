import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
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
  @tracked filtersOpen = false;
  @tracked submissionFilter = null;

  constructor() {
    super(...arguments);
    this.submissionFilter = null;
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
