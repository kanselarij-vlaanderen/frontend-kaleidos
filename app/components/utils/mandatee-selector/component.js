import Component from '@ember/component';
import { inject } from '@ember/service';
import { filter } from '@ember/object/computed';
import moment from 'moment';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';

export default Component.extend(ModelSelectorMixin, {
	classNames: ["mandatee-selector-container"],
	store: inject(),
	selectedMandatees: null,
	singleSelect: false,
	modelName: 'mandatee',
	sortField: 'priority',
	searchField: 'title',
	includeField: 'person',

	filteredMandatees: filter('items.@each', function (mandatee) {
		if (!mandatee.end || (moment(mandatee.end).utc().toDate() > moment().utc().toDate())) {
			if (moment(mandatee.start).utc().toDate() < (moment().utc().toDate())) {
				return mandatee;
			}
		}
	}),

	actions: {
		async chooseMandatee(mandatees) {
			this.set('selectedMandatees', mandatees);
			this.chooseMandatee(mandatees);
		},
	}
});
