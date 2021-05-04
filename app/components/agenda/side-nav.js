import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({
  sessionService: inject(),
  classNames: ['auk-sidebar', 'auk-sidebar--gray-200', 'auk-sidebar--left', 'auk-sidebar--small', 'auk-sidebar--collapsible', 'auk-scroll-wrapper'],

  attributeBindings: ['getCollapsedAttribute:data-collapsed'],

  getCollapsedAttribute: computed('agendaMenuCollapsed', function() {
    return this.get('agendaMenuCollapsed').toString();
  }),

  agendaMenuCollapsed: false,

  currentAgenda: alias('sessionService.currentAgenda'),
  currentSession: alias('sessionService.currentSession'),

  actions: {
    collapseSideMenu() {
      this.toggleProperty('agendaMenuCollapsed');
    },

    compareAgendas() {
      this.compareAgendas();
    },

    setCurrentAgenda(agenda) {
      this.selectAgenda(agenda);
    },
  },
});
