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
      // bug in ember with refreshModel, keep this false (more info in loading action)
      refreshModel: false, 
    },
    showModifiedOnly: {
      refreshModel: true,
      as: 'toon_enkel_gewijzigd',
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
      sort: 'type.position,number',
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

    if (params.showModifiedOnly) {
      // "modified" here is interpreted as "new item or existing item with changes in its related documents"
      if (previousAgenda) {
        const modItems = await this.agendaService.modifiedAgendaItems(agenda.id, previousAgenda.id, ['documents']);
        agendaitems = agendaitems.filter((item) => [...new Set(newItems.concat(modItems))].includes(item));
      }
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

  resetController(controller, isExiting) {
    if (isExiting) {
      // isExiting would be false if only the route's model was changing
      controller.set('filter', null);
    }
  }

  @action
  // eslint-disable-next-line no-unused-vars
  loading(transition) {
    // Currently there is a bug in ember with refreshModel where the model keeps refresing even though it there is no need.
    // This is causing many visual refreshes in our code in cetain situations.
    // https://github.com/emberjs/ember.js/issues/19497
    // In order to fix this: When searching we do a transitionTo from the controller and a manual model refresh instead
    // In that case, we can just rely on the default behavior of ember and not block the transition.

    // When should we show the loader on this level:
    // - when searching the model should reload (manual refresh from controller)
    // - when filtering on modifiedOnly the model should reload (ember default behavior with refreshModel, this one is not broken)
    // - when entering the route the first time (ember default behavior building top down)
    // - when switching subroutes on 'agenda' route (ex. agenda.documents to agenda.agendaitem, ember default behavior)

    // When should we NOT show the loader on this level:
    // - when switching between agendaitems (agenda.agendaitems.agendaitem.* subroutes with id to a different id)
    // - when switching between agendaitem tabs (agenda.agendaitems.agendaitem.* subroutes with same id)
    // in both those cases ember default behavior will trigger 'agenda.agendaitems.agendaitem.loading' to show

    // so for all of those cases, we can just bubble and let ember handle it.
    return true;
  }
}
