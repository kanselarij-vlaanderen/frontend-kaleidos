import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';

export default class SignaturesOngoingRatificationsController extends Controller {
  @service store;
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
    '-meeting.planned-start',
    'sign-subcase.sign-marking-activity.piece.name',
  ].join(',');
  @tracked isLoadingModel;
  @tracked mandatees = [];
  @tracked statuses = [];
  @tracked dateFrom;
  @tracked dateTo;
  @tracked excludedStatuses = [CONSTANTS.SIGNFLOW_STATUSES.MARKED]


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
          this.router.transitionTo(`/document/${piece.id}`)
      } else {
        const signingHubUrl = await this.signatureService.getSigningHubUrl(signFlow, piece);
        if (signingHubUrl) {
          window.open(signingHubUrl, '_blank');
        } else {
          this.router.transitionTo(`/document/${piece.id}`)
        }
      }
    }
  }

  @action
  async onClickRow (signFlow) {
    if (await this.isRowDisabled(signFlow)) {
      return;
    }
    await this.navigateToSignFlow(signFlow);
  }

  @action
  onChangeStatus(statuses) {
    this.statuses = statuses;
  }

  @action
  setDateFrom(date) {
    this.dateFrom = formatDate(date);
  }

  @action
  setDateTo(date) {
    this.dateTo = formatDate(date);
  }

  @action
  async isRowDisabled(row) {
    if (this.currentSession.may('view-all-ongoing-signatures')) {
      return false;
    }

    const creator = await row.creator;
    return creator.id !== this.currentSession.user.id;
  }

  getMeetingDate = async (signFlowOrPromise) => {
    const signFlow = await signFlowOrPromise;
    const meeting = await signFlow.meeting;
    return meeting.plannedStart;
  }
}
