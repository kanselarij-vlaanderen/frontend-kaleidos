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

    const filter = {
      'sign-subcase': {
        'sign-marking-activity': {
          piece: {
            'is-report-or-minutes': true,
            ':has-no:next-piece': 'yes'
          }
        },
        ':has-no:sign-preparation-activity': 'yes',
      },
      status: {
        ':uri:': CONSTANTS.SIGNFLOW_STATUSES.MARKED,
      }
    };

    this.lastParams.commit();

    if (this.ministerIds?.length) {
      filter['decision-activity']['subcase'] = {
        'requested-by': {
          ':id:': this.ministerIds.join(',')
        }
      };
    } else if (this.currentSession.may('manage-only-specific-signatures')) {
      return [];
    }

    return this.store.query('sign-flow', {
      filter,
      include: [
        'decision-activity',
        'sign-subcase.sign-marking-activity.piece.document-container.type'
      ].join(','),
      page: {
        number: params.pageSignaturesDecisions,
        size: params.sizeSignaturesDecisions,
      },
      sort: params.sortSignaturesDecisions,
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);
    controller.filteredMinisters = this.ministerIds;
    controller.selectedMinisters = this.ministerIds;

    if (controller.pageSignaturesDecisions !== this.lastParams.committed.pageSignaturesDecisions) {
      controller.pageSignaturesDecisions = this.lastParams.committed.pageSignaturesDecisions;
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
