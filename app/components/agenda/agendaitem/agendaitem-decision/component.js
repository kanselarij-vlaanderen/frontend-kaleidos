import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ["o-scroll"],
	store: inject(),
	isEditing: false,
	agendaitem:null,

	actions: {
		async addDecision(agendaitem){
      let decision = this.store.createRecord("decision", {
        agendaItem: agendaitem
			});
			decision.save().then(decision => {
				agendaitem.set('decision', decision);
			});
		},
		
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async saveChanges(agendaitem) {
			let decision = await agendaitem.get('decision');
			decision.save().then(() => {
				this.toggleProperty('isEditing');
			})
		}
	}
});
