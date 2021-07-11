import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import search from 'frontend-kaleidos/utils/mu-search';
import { animationFrame } from 'ember-concurrency';

export default class AgendaAgendaitemsRoute extends Route {
  queryParams = {
    filter: {
      refreshModel: true,
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

  async model(params) {
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');

    // Could be optimized not to make below query again when only query params changed
    let agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'page[size]': PAGE_SIZE.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    // Ensure mandatee data for each agendaitem is loaded
    await Promise.all(agendaitems.map((agendaitem) => {
      this.store.findRecord('agendaitem', agendaitem.id, {
        reload: true, // without reload the async operation will be resolved too early by ember-data's cache
        include: [
          'mandatees'
        ].join(','),
        'fields[mandatees]': [
          'title', // Display group header per agendaitems group
          'priority' // Sorting agendaitems on minister protocol order
        ].join(','),
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
        ':phrase_prefix:title,shortTitle': `${params.filter}`,
        meetingId: meeting.id,
        agendaId: agenda.id,
      };
      const matchingIds = await search('agendaitems', 0, 500, null, filter, (agendaitem) => agendaitem.id);
      agendaitems = agendaitems.filter((ai) => matchingIds.includes(ai.id));
    }

    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);
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

  async setupController(controller, model) {
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
      controller.groupNotasOnGroupName.perform(model.notas)
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
  reloadModel() {
    this.refresh();
  }
}
