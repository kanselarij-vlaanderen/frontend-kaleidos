import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
export default Component.extend({
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	agendaitem: null,
	subcase: null,

	title: computed('agendaitem', 'subcase', function () {
		const { agendaitem, subcase } = this;
		if (subcase) {
			return subcase.get('title');
		} else {
			return agendaitem.get('subcase').get('title');
		}
	}),

	shortTitle: computed('agendaitem', 'subcase', function () {
		const { agendaitem, subcase } = this;
		if (subcase) {
			return subcase.get('shortTitle');
		} else {
			return agendaitem.get('subcase').get('shortTitle');
		}
	}),

	formallyOk: computed('agendaitem', 'subcase', function () {
		const { agendaitem, subcase } = this;
		if (subcase) {
			return subcase.get('formallyOk');
		} else {
			return agendaitem.get('subcase.formallyOk');
		}
	}),

	confidentiality: computed('agendaitem', 'subcase', function () {
		const { agendaitem, subcase } = this;
		if (subcase) {
			return subcase.get('confidentiality');
		} else {
			return agendaitem.get('subcase.confidentiality');
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
			const { subcase, agendaitem } = this;
			if (agendaitem) {
				const isDesignAgenda = await agendaitem.get('agenda.name');
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
				if(agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0){
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
