import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	isEditing: false,
	subcase: null,
	agendaitem: null,

	selectedPhases: computed('subcase.phases','agendaitem.phases', {
		get() {
			const { agendaitem, subcase } = this;
			if (agendaitem) {
				return agendaitem.get('phasesToShow');
			} else {
				return subcase.get('phases');
			}
		},
		set: function (key, value) {
			return value;
		}
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			const { agendaitem, subcase } = this;
			if(agendaitem) {
				const model = this.store.peekRecord('agendaitem', agendaitem.get('id'));
				model.hasMany('phases').reload();
			} else if (subcase){
				const model = this.store.peekRecord('subcase', subcase.get('id'));
				model.hasMany('phases').reload();
			}
			this.toggleProperty('isEditing');
		},

		choosePhase(phase) {
			this.set('selectedPhase', phase);
		},

		async saveChanges() {
			const agendaitem = this.store.peekRecord('agendaitem', this.get('agendaitem').get('id'));
			if(agendaitem) {
				const isDesignAgenda = await agendaitem.get('isDesignAgenda');
				if (isDesignAgenda) {
					const subcase = await agendaitem.get('subcase');
					this.addSubcasePhaseToModel(subcase, 'subcase').then(() => {
						subcase.hasMany('phases').reload();
					});
				}
				this.addSubcasePhaseToModel(agendaitem, 'agendaitem').then(() => {
					agendaitem.hasMany('phases').reload();
					this.toggleProperty('isEditing');
				});
			} else {
				const subcase = await this.store.peekRecord('subcase', subcase.get('id'));
				this.addSubcasePhaseToModel(subcase, 'subcase').save().then(() => {
					subcase.hasMany('phases').reload();
				});
				const agendaitemsOnDesignAgendaToEdit = await subcase.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						this.addSubcasePhaseToModel(agendaitem,'agendaitem').then(() => {
							agendaitem.hasMany('phases').reload();
							this.toggleProperty('isEditing');
						});
					})
				}
			}

		}
	},

	async addSubcasePhaseToModel(model, type) {
		const selectedPhase = this.get('selectedPhase');
		if(type === "agendaitem") {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: selectedPhase,
				agendaitem:model
			});
			return modelPhase.save();
		} else {
			const modelPhase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: selectedPhase,
				subcase:model
			});
			return modelPhase.save();
		}
	}
});
