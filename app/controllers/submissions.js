import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesSubmissionsIndexController extends Controller {
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
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sortSubmissions = '-planned-start';
  @tracked dateFrom = null;
  @tracked dateTo = null;
  @tracked submitters = [];
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
  updateToggleableFilters() {
    this.hasToggleableFilters = (window.innerWidth < 768) ? true : false;
  }

  @action
  onToggleFilters(open) {
    this.filtersOpen = open;
  }

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
