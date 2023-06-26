import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SignaturesIndexRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    }
  };

  localStorageKey = 'signatures.shortlist.minister-filter';

  ministerIds = [];

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
    const filter = {
      status: {
        ':uri:': CONSTANTS.SIGNFLOW_STATUSES.MARKED,
      }
    };

    if (this.ministerIds?.length) {
      filter['decision-activity'] = {
        subcase: {
          'requested-by': {
            ':id:': this.ministerIds.join(',')
          }
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
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);
    controller.filteredMinisters = this.ministerIds;
    controller.selectedMinisters = this.ministerIds;
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
