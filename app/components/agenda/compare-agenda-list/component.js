import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject } from '@ember/service';
import { on } from '@ember/object/evented';

export default Component.extend({
	store: inject(),
	agendaToCompare: null,
	currentAgenda: null,

	currentAgendaItemsObserver: on('init', observer('currentAgenda', async function () {
		let agendaItems = await this.store.query('agendaitem', {
			filter: {
				'agenda': { id: this.currentAgenda.id }
			},
			include: 'subcase'
		});

		this.set('currentAgendaItems', agendaItems);
	})),

	agendaToCompareAgendaItemsObserver: on('init', observer('agendaToCompare', async function () {
		let agendaItems = await this.store.query('agendaitem', {
			filter: {
				'agenda': { id: this.agendaToCompare.id }
			},
			include: 'subcase'
		})
		this.set('agendaToCompareAgendaItems', agendaItems);
	})),

	changedItems: computed('currentAgendaItems.@each', 'agendaToCompareAgendaItems.@each', function () {
		let subcaseLookup = {};
		
		(this.currentAgendaItems || []).map(item => {
			let subcaseId = item.get('subcase.id');
			subcaseLookup[subcaseId] = {current: item};
		});
		
		(this.agendaToCompareAgendaItems || []).map(item => {
			let subcaseId = item.get('subcase.id');
			subcaseLookup[subcaseId] = subcaseLookup[subcaseId] || {};
			subcaseLookup[subcaseId].previous = item;
		});
	
		return Object.keys(subcaseLookup).map((key) => {
			return subcaseLookup[key];
		});
	}),
})
