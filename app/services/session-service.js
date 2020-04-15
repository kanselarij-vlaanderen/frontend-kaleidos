import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import DS from 'ember-data';
let { PromiseArray } = DS;
import { all } from 'rsvp';

export default Service.extend({
  store: inject(),
  router: inject(),
  currentSession: null,
  selectedAgendaItem: null,

  agendas: computed('currentSession.agendas.@each', function () {
    if (!this.get('currentSession')) {
      return [];
    }
    return PromiseArray.create({
      promise: this.get('currentSession.agendas').then( async (agendas) => {
        await all(agendas.map((agenda) => {
          return agenda.load('status');
        }));
        return agendas.sortBy('serialnumber').reverse();
      })
    });
  }),

  currentAgendaItems: computed('currentAgenda.agendaitems.@each', function () {
    let currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      return this.store.query('agendaitem', {
        filter: {
          agenda: { id: currentAgenda.id },
        },
        include: ['subcase,subcase.case'],
        sort: 'priority',
      });
    } else {
      return [];
    }
  }),

  announcements: computed('currentAgenda.announcements.@each', function () {
    let currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      let announcements = this.store.query('announcement', {
        filter: {
          agenda: { id: currentAgenda.id },
        },
      });
      return announcements;
    } else {
      return [];
    }
  }),

  definiteAgendas: computed('agendas', function () {
    return this.get('agendas').filter((agenda) => !agenda.get('isDesignAgenda')).sortBy('-name');
  }),

  async findPreviousAgendaOfSession(session, agenda) {
    const agendas = await session.get('sortedAgendas');
    if (agendas) {
      const foundIndex = agendas.indexOf(agenda);
      const agendasLength = agendas.get('length');
      if (foundIndex + 1 != agendasLength) {
        const previousAgenda = agendas.objectAt(foundIndex + 1);
        return previousAgenda;
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  async deleteSession(session) {
    const newsletter = await session.get('newsletter');
    if (newsletter) {
      await newsletter.destroyRecord();
    }

    await session.destroyRecord();
    this.router.transitionTo('agendas');
  },

});
