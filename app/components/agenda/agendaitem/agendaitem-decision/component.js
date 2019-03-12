import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ["vl-u-spacer-extended-l"],
	store: inject(),
	isEditing: false,
	agendaitem:null,

	actions: {
		async addDecision(agendaitem){
      let decision = this.store.createRecord("decision", {
				agendaItem: agendaitem,
				shortTitle: agendaitem.subcase.get('shortTitle')
			});
			decision.save().then(decision => {
				agendaitem.set('decision', decision);
				this.toggleProperty('isEditing');
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
