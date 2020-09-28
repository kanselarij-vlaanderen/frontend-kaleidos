import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  sessionService: inject(),
  classNameBindings: ['classes'],
  store: inject(),
  propertyToShow: null,
  placeholder: null,
  sortField: null,
  filter: null,
  selectedAgenda: null,

  agendas: computed('sessionService.agendas', function() {
    return this.sessionService.get('agendas');
  }),

  actions: {
    selectModel(items) {
      this.selectModel(items);
    },
  },
});
