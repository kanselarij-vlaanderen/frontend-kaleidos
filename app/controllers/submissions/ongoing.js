import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesSubmissionsOngoingController extends Controller {
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
      submitters: {
        type: 'array',
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
  @tracked sortSubmissions = '-planned-start';
  @tracked dateFrom = null;
  @tracked dateTo = null;
  @tracked submitters = [];
  @tracked isLoadingModel;
  @tracked filtersOpen = false;
  @tracked submissionFilter = null;

  @action
  onToggleFilters(open) {
    this.filtersOpen = open;
  }

  @action
  setSubmitters(submitters) {
    this.submitters = submitters;
  }

  setSubmissionFilter = (value) => (this.submissionFilter = value);

  selectSize = (size) => (this.size = size);
  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  setDateFrom = (date) => (this.dateFrom = formatDate(date));
  setDateTo = (date) => (this.dateTo = formatDate(date));

  get mayShowMinisterFilter() {
    return this.currentSession.may('view-all-submissions');
  }

  navigateToSubmission = (submission) => {
    this.router.transitionTo(
      'cases.submissions.submission',
      submission.id
    );
  }

  getMandateeNames = async (submission) => {
    const submitter = await submission.requestedBy;
    const mandatees = await submission.mandatees;
    const persons = await Promise.all(
      mandatees
        .slice()
        .filter((m) => submitter?.id !== m.id)
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  };
}
