// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
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

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    selectModel(items) {
      this.selectModel(items);
    },
  },
});
