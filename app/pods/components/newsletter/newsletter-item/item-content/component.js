import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-typography'],
  classNameBindings: ['isFlandersArt:vl-typography--definite'],
  newsletterService: inject(),
  currentSession: inject(),
  allowEditing: false,
  definite: false,
  itemIndex: 0,
  isEditing: false,
  agendaitem: null,
  newsletterInfo: null,

  isFlandersArt: computed('allowEditing', function() {
    return !this.allowEditing;
  }),

  numberToShow: computed('agendaitem.{number,showAsRemark}', 'itemIndex', 'definite', function() {
    if (this.agendaitem.showAsRemark && this.definite === 'true') {
      return '';
    }
    if (this.itemIndex) {
      return `${this.itemIndex}.`;
    }
    return `${this.agendaitem.get('number')}.`;
  }),

  actions: {
    async stopEditing() {
      this.set('isEditing', false);
    },
    async startEditing() {
      this.set('isEditing', true);
    },
  },
});
