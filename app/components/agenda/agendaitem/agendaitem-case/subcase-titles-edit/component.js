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
			const { subcase, agendaitem, title, shortTitle, formallyOk, confidentiality } = this;
			if (subcase) {
				subcase.set('title', title);
				subcase.set('shortTitle', shortTitle);
				subcase.set('formallyOk', formallyOk);
				subcase.set('confidentiality', confidentiality);
				subcase.save().then(() => {
					this.toggleIsEditing();
				});
			} else {
				const subcase = agendaitem.get('subcase');
				const subcaseToEdit = this.store.peekRecord('subcase', subcase.get('id'));
				subcaseToEdit.set('title', title);
				subcaseToEdit.set('shortTitle', shortTitle);
				subcaseToEdit.set('formallyOk', formallyOk);
				subcaseToEdit.set('confidentiality', confidentiality);
				subcaseToEdit.save().then(() => {
					this.toggleIsEditing();
				});
			}
		}
	}
});
