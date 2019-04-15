import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	agendaitem: null,
	subcase: null,

	title: computed('agendaitem', 'subcase', {
		get() {
			const { agendaitem, subcase } = this;
			if (agendaitem) {
				return agendaitem.get('titleToShow');
			} else {
				return subcase.get('title');
			}
		},
		set: function (key, value) {
			return value;
		}
	}),

	shortTitle: computed('agendaitem', 'subcase', {
		get() {
			const { agendaitem, subcase } = this;
			if (agendaitem) {
				return agendaitem.get('shortTitleToShow');
			} else {
				return subcase.get('shortTitle');
			}
		},
		set: function (key, value) {
			return value;
		}
	}),

	formallyOk: computed('agendaitem', 'subcase', {
		get() {
			const { agendaitem, subcase } = this;
			if (agendaitem) {
				return agendaitem.get('formallyOkToShow');
			} else {
				return subcase.get('formallyOk');
			}
		},
		set: function (key, value) {
			return value;
		}
	}),

	confidentiality: computed('agendaitem', 'subcase', function () {
		const { agendaitem, subcase } = this;
		if (agendaitem) {
			return agendaitem.get('confidentialityToShow');
		} else {
			return subcase.get('confidentiality');
		}
	}),

	actions: {
		toggleIsEditing() {
			this.toggleIsEditing();
		},

		selectConfidentiality(confidentiality) {
			this.set('confidentiality', confidentiality)
		},

		async saveChanges() {
			const { subcase, agendaitem, isDesignAgenda } = this;
			if (agendaitem) {
				if (isDesignAgenda) {
					const subcase = await agendaitem.get('subcase');
					await this.setNewPropertiesToModel(subcase);
				}
				const subcaseModel = await this.store.peekRecord('agendaitem', agendaitem.get('id'));
				this.setNewPropertiesToModel(subcaseModel).then(() => {
					this.toggleIsEditing();
				});
			} else {
				const subcaseModel = await this.store.peekRecord('subcase', subcase.get('id'));
				await this.setNewPropertiesToModel(subcaseModel);

				const agendaitemsOnDesignAgendaToEdit = await subcase.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						this.setNewPropertiesToModel(agendaitem).then(() => {
							this.toggleIsEditing();
						});
					})
				}
			}
		}
	},

	async setNewPropertiesToModel(model) {
		const { title, shortTitle, formallyOk, confidentiality } = this;

		model.set('title', title);
		model.set('shortTitle', shortTitle);
		model.set('formallyOk', formallyOk);
		model.set('confidentiality', confidentiality);
		return model.save();
	}

});
