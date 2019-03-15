import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["vl-u-spacer-extended-l"],
	store: inject(),
	isEditing: false,
	agendaitem:null,

	title: computed('agendaitem.decision', function() {
		return this.get('agendaitem').get('decision.shortTitle');
	}),

	actions: {
		async addDecision(agendaitem){
      let decision = this.store.createRecord("decision", {
				agendaItem: agendaitem,
				shortTitle: agendaitem.subcase.get('shortTitle'),
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
			decision.set('title', this.get('title'));
			decision.save().then(() => {
				this.set('title', null);
				this.toggleProperty('isEditing');
			})
		}
	}
});
