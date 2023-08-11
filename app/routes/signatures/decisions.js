import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class SignaturesDecisionsRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    pageSignaturesDecisions: {
      refreshModel: true,
      as: 'pagina',
    },
    sizeSignaturesDecisions: {
      refreshModel: true,
      as: 'aantal',
    },
    sortSignaturesDecisions: {
      refreshModel: true,
      as: 'sorteer',
    }
  };

  localStorageKey = 'signatures.shortlist.minister-filter';

  ministerIds = [];
  lastParams;

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async beforeModel() {
    if (this.currentSession.may('manage-only-specific-signatures')) {
      const currentUserOrganization = await this.currentSession.organization;
      const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
      const currentUserOrganizationMandateesIds = currentUserOrganizationMandatees?.map((mandatee) => mandatee.id);
      this.ministerIds = currentUserOrganizationMandateesIds;
    } else {
      this.ministerIds = JSON.parse(
        localStorage.getItem(this.localStorageKey)
      ) ?? [];
    }
  }

  async model(params) {
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'pageSignaturesDecisions')
      )
    ) {
      params.pageSignaturesDecisions = 0;
    }

    const reportFilter = {
      'decision-activity': {
        'decision-result-code': {
          ':uri:': CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD,
        },
        'sign-flow': {
          'sign-subcase': {
            ':has-no:sign-preparation-activity': 'yes',
          },
          status: {
            ':uri:': CONSTANTS.SIGNFLOW_STATUSES.MARKED
          }
        }
      }
    }

    const minutesFilter = {
      meeting: {
        agenda: {
          agendaitems: {
            piece: {
              'sign-marking-activity': {
                'sign-subcase': {
                  ':has-no:sign-preparation-activity': 'yes',
                  'sign-flow': {
                    status: {
                      ':uri:': CONSTANTS.SIGNFLOW_STATUSES.MARKED,
                    },
                    'decision-activity': {
                      'decision-result-code': {
                        ':uri:': CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    this.lastParams.commit();

    if (this.ministerIds?.length) {
      reportFilter['decision-activity']['secretary'] = {
          ':id:': this.ministerIds.join(',')
      };
    } else if (this.currentSession.may('manage-only-specific-signatures')) {
      return [];
    }

    const reports = this.store.query('report', {
      reportFilter,
      include: [
        'decision-activity',
        'decision-activity.sign-flow',
      ].join(','),
      page: {
        number: params.pageSignaturesDecisions,
        size: params.sizeSignaturesDecisions
      },
      sort: params.sortSignaturesDecisions
    })

    let reportSignfFlows = reports.map((report) => {
      return report.decisionActivity.signflows
    });

    const minutes = this.store.query('minutes', {
      minutesFilter,
      include: [
        'meeting.agenda.agendaitems.piece.sign-marking-activity.sign-subcase.sign-flow',
        'meeting.agenda.agendaitems.piece.sign-marking-activity.sign-subcase.sign-flow.decision-activity',
      ].join(','),
      page: {
        number: params.pageSignaturesDecisions,
        size: params.sizeSignaturesDecisions
      },
      sort: params.sortSignaturesDecisions
    })

    let minutesSignFlows = minutes.map((minute) => {
      return minute.meeting.agenda.agendaitems.signMarkingActivity.signSubcase.signFlow;
    });

    const signflows = [...reportSignfFlows, ...minutesSignFlows];
    return signflows;
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);
    controller.filteredMinisters = this.ministerIds;
    controller.selectedMinisters = this.ministerIds;

    if (controller.pageSignaturesIndex !== this.lastParams.committed.pageSignaturesIndex) {
      controller.pageSignaturesIndex = this.lastParams.committed.pageSignaturesIndex;
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.showSidebar = false;
      controller.showFilterModal = false;
      controller.piece = null;
      controller.decisionActivity = null;
      controller.agendaitem = null;
      controller.agenda = null;
      controller.meeting = null;
    }
  }
}