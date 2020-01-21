import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import moment from 'moment';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	item: null,
	propertiesToSet: Object.freeze(['phases']),

	modelIsAgendaItem(model) {
		const modelName = model.get('constructor.modelName')
		return modelName === 'agendaitem';
	},

	phasesToShow: computed('item', function () {
		const { modelIsAgendaItem, item } = this;
		if (modelIsAgendaItem) {
			return item.get('subcase.phases');
		} else {
			return item.get('phases');
		}
	}),

	actions: {
		choosePhase(phase) {
			this.set('selectedPhase', phase);
		}
	},

	async setNewPropertiesToModel(model) {
		const { selectedPhase } = this;
		if (this.modelIsAgendaItem(model)) {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: moment().utc().toDate(),
				code: selectedPhase,
				agendaitem: model
			});
			return modelPhase.save().then(() => {
				return model.hasMany('phases').reload();
			});
		} else {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: moment().utc().toDate(),
				code: selectedPhase,
				subcase: model
			});
			return modelPhase.save().then(() => {
				return model.hasMany('phases').reload();
			});
		}
	}
});
