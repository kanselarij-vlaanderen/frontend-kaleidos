import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	agendaitem:null,
	isEditing:false,

	title: computed('agendaitem', function() {
		return this.agendaitem.get('subcase.title');
	}),
	

	actions: {
		async toggleIsEditing() {
			const agendaitem = this.get('agendaitem');
			let text = agendaitem.get('textPress');
			if(!text) {
				const mandatees = await agendaitem.get('mandatees');
				const phases = await agendaitem.get('phases');
				let phase = "";
				if(phases && phases.length > 0) {
					phase = await phases.get('firstObject').get('code.label');
				}
				let titles = [];
				if(mandatees) {
					titles = mandatees.map((mandatee) => mandatee.get('title'));
				}
				const pressText = `${agendaitem.get('shortTitle')}\n${titles.join('\n')}\n${phase}`
				agendaitem.set('textPress', pressText);
				await agendaitem.save();
			}
			this.toggleProperty('isEditing');
		}
	}
});
