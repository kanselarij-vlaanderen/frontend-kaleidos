import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class AgendaSubmissionsController extends Controller {
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
      sort: {
        type: 'string',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sort = 'title';

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
