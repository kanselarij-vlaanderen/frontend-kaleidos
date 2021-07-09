import Service, { inject } from '@ember/service';
import { computed } from '@ember/object';

import DS from 'ember-data';
import { all } from 'rsvp';

const {
  PromiseArray,
} = DS;

export default Service.extend({
  store: inject(),
  router: inject(),
  currentSession: null,

  agendas: computed('currentSession.agendas.@each', function() {
    if (!this.get('currentSession')) {
      return [];
    }
    return PromiseArray.create({
      promise: this.get('currentSession.agendas').then(async(agendas) => {
        await all(agendas.map((agenda) => agenda.load('status')));
        return agendas.sortBy('serialnumber').reverse();
      }),
    });
  }),

  currentAgendaitems: computed('currentAgenda.agendaitems.@each', function() {
    const currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      return this.store.query('agendaitem', {
        filter: {
          agenda: {
            id: currentAgenda.id,
          },
        },
        include: ['agenda-activity,agenda-activity.subcase,agenda-activity.subcase.case'],
        sort: 'priority',
      });
    }
    return [];
  }),

  announcements: computed('currentAgenda.announcements.@each', function() {
    const currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      const announcements = this.store.query('announcement', {
        filter: {
          agenda: {
            id: currentAgenda.id,
          },
        },
      });
      return announcements;
    }
    return [];
  }),

  async findPreviousAgendaOfSession(meeting, agenda) {
    const agendas = await this.store.query('agenda', {
      'filter[created-for][:id:]': meeting.id,
      sort: '-serialnumber',
    });

    let previousAgenda = null;
    if (agendas) {
      const foundIndex = agendas.indexOf(agenda);
      if (foundIndex < agendas.length) {
        previousAgenda = agendas.objectAt(foundIndex + 1);
      }
    }

    return previousAgenda;
  },

  async deleteSession(session) {
    const newsletter = await session.get('newsletter');
    if (newsletter) {
      await newsletter.destroyRecord();
    }

    await session.destroyRecord();
  },

});
