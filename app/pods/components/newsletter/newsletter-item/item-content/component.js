import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-typography'],
  classNameBindings: ['isFlandersArt:vl-typography--definite'],
  newsletterService: inject(),
  currentSession: inject(),
  allowEditing: false,
  itemIndex: 0,
  isEditing: false,
  agendaitem: null,
  newsletterInfo: null,
  showIndex: true,

  isFlandersArt: computed('allowEditing', function() {
    return !this.allowEditing;
  }),

  actions: {
    startEditing() {
      if (this.onStartEditing) {
        this.onStartEditing();
      }
    },
  },
});
