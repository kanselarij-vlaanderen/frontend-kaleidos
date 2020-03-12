import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';
import { computed } from '@ember/object';

export default Component.extend(ModelSelectorMixin, {
  classNames: ['mandatee-selector-container'],
  store: inject(),
  selectedMandatees: null,
  singleSelect: false,
  modelName: 'mandatee',
  sortField: 'priority',
  searchField: 'title',
  includeField: 'person',

  filter: computed(function () {
    return { ':gte:end': moment().utc().toDate().toISOString() };
  }),

  actions: {
    async chooseMandatee(mandatees) {
      this.set('selectedMandatees', mandatees);
      this.chooseMandatee(mandatees);
    },
  }
});
