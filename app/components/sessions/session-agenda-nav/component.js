import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  routing: inject('-routing'),
  sessionService: inject(),
  currentSession: inject(),
  tagName: 'ul',
  classNames: ['vlc-toolbar__item'],

  firstAgendaItemOfAgenda: computed('currentAgenda.firstAgendaItem', function () {
    return this.get('currentAgenda.firstAgendaItem');
  }),

  selectedAgendaitemClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName') === 'agenda.agendaitems.agendaitem') {
      return 'vlc-tabs-reverse__link--active';
    }
  }),

  selectedOverviewClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName') === 'agenda.agendaitems.index') {
      return 'vlc-tabs-reverse__link--active';
    }
  }),

  selectedCompareClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName') === 'agenda.compare') {
      return 'vlc-tabs-reverse__link--active';
    }
  }),

  selectedDocumentClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName') === 'agenda.documents') {
      return 'vlc-tabs-reverse__link--active';
    }
  }),

  actions: {
    compareAgendas() {
      this.compareAgendas();
    },

    goToOverview() {
      this.clearSelectedAgendaItem();
    },

    navigateToDocuments() {
      this.navigateToDocuments();
    },
  }
});
