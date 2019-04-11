import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	isEditing: false,
	subcase: null,

	selectedThemes: computed('subcase', function () {
		return this.get('subcase.themes');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.set('selectedThemes', this.get('subcase.themes'));
			this.toggleProperty('isEditing');
		},

		chooseTheme(themes) {
			this.set('selectedThemes', themes);
		},

		async saveChanges(subcase) {
			const { agendaitem } = this;
			if (agendaitem) {
				const isDesignAgenda = await agendaitem.get('agenda.name');
				if (isDesignAgenda) {
					const subcase = await agendaitem.get('subcase');
					subcase.set('themes', this.get('selectedThemes'));
					await subcase.save();
				}
				const subcaseModel = this.store.peekRecord('agendaitem', subcase.get('id'));
				subcaseModel.set('themes', this.get('selectedThemes'));
				subcaseModel.save().then(() => {
					this.toggleProperty('isEditing');
				});
			} else {
				const subcaseModel = await this.store.peekRecord('subcase', subcase.get('id'));
				subcaseModel.set('themes', this.get('selectedThemes'));
				subcaseModel.save().then(() => {
					this.toggleProperty('isEditing');
				});
				const agendaitemsOnDesignAgendaToEdit = await this.store.query('agendaitem', {
					filter: {
						subcase: {id : subcase.get('id')},
						agenda: {name: "Ontwerpagenda"}
					}
				});
				if(agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0){
					agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						agendaitem.set('themes', this.get('selectedThemes'));
						agendaitem.save();
					})
				}
			}
		}
	}
});
