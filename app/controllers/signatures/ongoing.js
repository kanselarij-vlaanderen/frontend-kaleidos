import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';

export default class SignaturesOngoingController extends Controller {
  @service router;
  @service mandatees;
  @service intl;
  @service currentSession;
  @service signatureService;

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
      mandatees: {
        type: 'array',
      },
      statuses: {
        type: 'array',
      },
      dateFrom: {
        type: 'string',
      },
      dateTo: {
        type: 'string',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[3];
  @tracked sort = [
    '-decision-activity.start-date',
    'decision-activity',
    'sign-subcase.sign-marking-activity.piece.name',
  ].join(',');
  @tracked isLoadingModel;
  @tracked mandatees = [];
  @tracked statuses = [];
  @tracked dateFrom;
  @tracked dateTo;
  @tracked excludedStatuses = [CONSTANTS.SIGNFLOW_STATUSES.MARKED];

  isConfidential = (accessLevel) => {
    return [
      CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
    ].includes(accessLevel.get('uri'));
  }

  @action
  async navigateToSignFlow (signFlow) {
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;
    const status = await signFlow.status;

    if (piece) {
      if (status.uri === CONSTANTS.SIGNFLOW_STATUSES.MARKED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.SIGNED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.REFUSED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.CANCELED) {
        window.open(`/document/${piece.id}`, '_blank');
      } else {
        const signingHubUrl = await this.signatureService.getSigningHubUrl(signFlow, piece);
        if (signingHubUrl) {
          window.open(signingHubUrl, '_blank');
        } else {
          window.open(`/document/${piece.id}`, '_blank');
        }
      }
    }
  }

  @action
  onChangeStatus(statuses) {
    this.statuses = statuses;
  }

  @action
  setMandatees(mandatees) {
    this.mandatees = mandatees;
  }

  @action
  setDateFrom(date) {
    this.dateFrom = formatDate(date);
  }

  @action
  setDateTo(date) {
    this.dateTo = formatDate(date);
  }

  getMandateeNames = async (signFlow) => {
    const signSubcase = await signFlow.signSubcase;
    const signSigningActivities = await signSubcase.signSigningActivities;
    const mandatees = await Promise.all(
      signSigningActivities.map((activity) => activity.mandatee)
    );
    const persons = await Promise.all(
      mandatees
        .toArray()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  };
}
