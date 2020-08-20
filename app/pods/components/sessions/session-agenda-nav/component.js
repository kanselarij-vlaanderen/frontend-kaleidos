import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  routing: inject('-routing'),
  sessionService: inject(),
  currentSession: inject(),
  tagName: 'ul',
  classNames: ['vlc-toolbar__item'],

  firstAgendaitemOfAgenda: computed('currentAgenda.firstAgendaitem', function() {
    return this.get('currentAgenda.firstAgendaitem');
  }),

  selectedAgendaitemClass: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    if (routing.get('currentRouteName').includes('agenda.agendaitems.agendaitem.')) {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }),

  selectedOverviewClass: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    if (routing.get('currentRouteName') === 'agenda.agendaitems.index') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }),

  selectedCompareClass: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    if (routing.get('currentRouteName') === 'agenda.compare') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }),

  selectedDocumentClass: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    if (routing.get('currentRouteName') === 'agenda.documents') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }),

  actions: {
    compareAgendas() {
      this.compareAgendas();
    },

    goToOverview() {
      this.clearSelectedAgendaitem();
    },

    navigateToDocuments() {
      this.navigateToDocuments();
    },
  },
});
