import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ["o-scroll"],
	store: inject(),
	isEditing: false,

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

		saveChanges(agendaitem) {
			agendaitem.save().then(() => {
				this.toggleProperty('isEditing');
			})
		}
	}
});
