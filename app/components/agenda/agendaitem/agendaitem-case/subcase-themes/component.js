import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	isEditing: false,
	subcase: null,

	selectedThemes: computed('subcase.themes', 'agendaitem.themes', {
		get() {
			const { agendaitem, subcase } = this;
			if (agendaitem) {
				return agendaitem.get('sortedThemes');
			} else {
				return subcase.get('sortedThemes');
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
				model.hasMany('themes').reload();
			} else if (subcase){
				const model = this.store.peekRecord('subcase', subcase.get('id'));
				model.hasMany('themes').reload();
			}
			this.toggleProperty('isEditing');
		},

		chooseTheme(themes) {
			this.set('selectedThemes', themes);
		},

		async saveChanges(subcase) {
			const { agendaitem, selectedThemes } = this;
			if (agendaitem) {
				const isDesignAgenda = await agendaitem.get('isDesignAgenda');
				if (isDesignAgenda) {
					const subcase = await agendaitem.get('subcase');
					subcase.set('themes', selectedThemes);
					await subcase.save();
				}
				const subcaseModel = this.store.peekRecord('agendaitem', agendaitem.get('id'));
				subcaseModel.set('themes', selectedThemes);
				subcaseModel.save().then(() => {
					this.toggleProperty('isEditing');
				});
			} else {
				const subcaseModel = await this.store.peekRecord('subcase', subcase.get('id'));
				subcaseModel.set('themes', selectedThemes);
				subcaseModel.save();
				const agendaitemsOnDesignAgendaToEdit = await subcase.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						agendaitem.set('themes', selectedThemes);
						agendaitem.save();
					})
				}
				this.toggleProperty('isEditing');
			}
		}
	}
});
