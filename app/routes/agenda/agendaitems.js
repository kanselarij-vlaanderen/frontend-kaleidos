import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import search from 'frontend-kaleidos/utils/mu-search';
import { animationFrame } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaAgendaitemsRoute extends Route {
  queryParams = {
    filter: {
      refreshModel: true,
    },
    anchor: {
      refreshModel: false,
    },
  };

  @service agendaService;
  @service store;

  async model(params) {
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');

    // Could be optimized not to make below query again when only query params changed
    // *NOTE* Do not change this query, this call is pre-cached by cache-warmup-service
    let agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: 'type',
      'page[size]': PAGE_SIZE.AGENDAITEMS,
      sort: 'type,number',
    });

    // Ensure mandatee data for each agendaitem is loaded
    // *NOTE* Do not change this findRecord, this call is pre-cached by cache-warmup-service
    await Promise.all(agendaitems.map((agendaitem) => {
      this.store.findRecord('agendaitem', agendaitem.id, {
        reload: true, // without reload the async operation will be resolved too early by ember-data's cache
        include: 'mandatees',
      });
    }));

    const previousAgenda = await agenda.previousVersion;
    let newItems;
    if (previousAgenda) {
      newItems = await this.agendaService.newAgendaItems(agenda.id, previousAgenda.id);
    } else {
      newItems = agendaitems;
    }

    if (params.filter) {
      const filter = {
        ':phrase_prefix:title,shortTitle,pieceNames': `${params.filter}`,
        meetingId: meeting.id,
        agendaId: agenda.id,
      };
      const matchingIds = await search('agendaitems', 0, 500, null, filter, (agendaitem) => agendaitem.id);
      agendaitems = agendaitems.filter((ai) => matchingIds.includes(ai.id));
    }

    const notas = [];
    const announcements = [];
    for (const agendaitem of agendaitems.toArray()) {
      const type = await agendaitem.type;
      if (type?.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
        announcements.push(agendaitem);
      } else {
        notas.push(agendaitem);
      }
    }
    const filteredNewItems = newItems.filter((agendaitem) => agendaitems.includes(agendaitem));

    this.previousAgenda = previousAgenda; // for use in setupController
    return hash({
      notas,
      announcements,
      newItems: filteredNewItems,
    });
  }

  afterModel(model, transition) { // eslint-disable-line no-unused-vars
    this.transition = transition; // set on the route for use in setupController, since the provided "transition" argument there always comes back "undefined"
  }

  async setupController(controller) {
    super.setupController(...arguments);
    const isTransitionToIndex = this.transition.to.name === 'agenda.agendaitems.index';
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.previousAgenda = this.previousAgenda;

    const promises = [
      controller.groupNotasOnGroupName.perform()
    ];
    if (isTransitionToIndex) {
      // Documents are only shown in agendaitems overview and not in agendaitems sidebar
      promises.push(controller.loadDocuments.perform());
    }
    await Promise.all(promises);

    await animationFrame(); // make sure rendering has happened before trying to scroll
    controller.scrollToAnchor();
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });

    // If only the filter queryParam changed, we don't want to bubble
    // the loading event so we can handle it ourselves with an inline loader.
    // When changing routes, e.g. when switching tabs, or when other queryParams
    // change we do want to display the loading page.
    if (transition.queryParamsOnly && transition.from && transition.to) {
      return transition.from.queryParams?.filter === transition.to.queryParams?.filter;
    }
    return true;
  }
}
