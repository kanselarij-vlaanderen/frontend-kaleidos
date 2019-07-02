import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';
import moment from 'moment';

export default Component.extend(ModelSelectorMixin, {
	store: inject(),
	currentSession: null,
	modelName: "meeting",
	searchField: "planned-start",
	sortField: "planned-start",
	filter: { ":gte:planned-start": moment().utc().format() },

	sortedSessions: computed.sort('items', function (a, b) {
		if (a.plannedStart > b.plannedStart) {
			return 1;
		} else if (a.plannedStart < b.plannedStart) {
			return -1;
		}
		return 0;
	})
});
