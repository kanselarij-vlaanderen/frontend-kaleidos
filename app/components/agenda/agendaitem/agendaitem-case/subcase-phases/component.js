import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from '../../../../../mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	item:null,
	propertiesToSet: ['phases'],

	modelIsAgendaItem(model) {
		const modelName = model.get('constructor.modelName')
		return modelName === 'agendaitem';
	},

	actions: {
		choosePhase(phase) {
			this.set('selectedPhase', phase);
		}
	},

	async setNewPropertiesToModel(model) {
		const { selectedPhase} = this;
		if(this.modelIsAgendaItem(model)) {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: selectedPhase,
				agendaitem: model
			});
			return modelPhase.save().then(() => {
				return model.hasMany('phases').reload();
			});
		} else {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: selectedPhase,
				subcase: model
			});
			return modelPhase.save().then(() => {
				return model.hasMany('phases').reload();
			});
		}
	}
});
