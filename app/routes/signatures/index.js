import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';

export default class SignaturesIndexRoute extends Route {
  @service store;
  @service currentSession;

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

  async model() {
    const endpoint = '/sign-flows/shortlist';
    const response = await fetch(endpoint, {
      Headers: {
        'Accept': 'application/vnd.api+json',
      }
    });
    const result = await response.json();

    if (result?.data?.length) {
      const query = {
        include: [
          'agendaitems.agenda.next-version',
          'agendaitems.mandatees.person',
          'agendaitems.treatment.decision-activity',
          'document-container.type',
        ].join(','),
        sort: '-created',
        'page[size]': result.data.length,
        filter: {
          ':id:': result.data.map((record) => record.id).join(','),
        }
      };
      if (this.ministerIds?.length) {
        query.filter.agendaitems = {
          treatment: {
            'decision-activity': {
              subcase: {
                'requested-by': {
                  ':id:': this.ministerIds.join(',')
                }
              }
            }
          }
        };
      }
      if (this.currentSession.may('manage-only-specific-signatures') && !this.ministerIds?.length) {
        return [];
      }
      return this.store.query('piece', query);
    }

    return [];
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
