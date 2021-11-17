// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNameBindings: ['classes'],
  store: inject(),
  propertyToShow: null,
  placeholder: null,
  sortField: null,
  filter: null,
  selectedAgenda: null,
  agendas: null,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    selectModel(items) {
      this.selectModel(items);
    },
  },
});
