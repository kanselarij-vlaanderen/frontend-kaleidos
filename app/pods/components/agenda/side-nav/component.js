import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({
  sessionService: inject(),
  classNames: ['vlc-panel-layout__agenda-history'],

  classNameBindings: ['getClassNames'],

  getClassNames: computed('agendaMenuOpened', function() {
    if (this.get('agendaMenuOpened')) {
      return 'vlc-panel-layout__agenda-history--collapsed';
    }
    return null;
  }),

  agendaMenuOpened: false,

  currentAgenda: alias('sessionService.currentAgenda'),
  currentSession: alias('sessionService.currentSession'),

  actions: {
    collapseSideMenu() {
      this.toggleProperty('agendaMenuOpened');
    },

    compareAgendas() {
      this.compareAgendas();
    },

    setCurrentAgenda(agenda) {
      this.selectAgenda(agenda);
    },
  },
});
