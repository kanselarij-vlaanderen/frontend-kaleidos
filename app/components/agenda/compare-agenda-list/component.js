import Component from '@ember/component';
import { observer } from '@ember/object';

export default Component.extend({
	agendaToCompare: null,
	currentAgenda: null,

	currentAgendaItemsObserver: observer('currentAgenda', async function () {
		let agendaItems = await this.get('currentAgenda.agendaitems');
		this.set('currentAgendaItems', agendaItems);
	}),

	agendaToCompareAgendaItemsObserver: observer('agendaToCompare', async function () {
		let agendaItems = await this.get('agendaToCompare.agendaitems')
		this.set('agendaToCompareAgendaItems', agendaItems);
	}),

	comparedItemsObserver: observer('currentAgendaItems', 'agendaToCompareAgendaItems', async function () {
		if (this.currentAgendaItems && this.agendaToCompareAgendaItems) {
			let newItems = [];
			await Promise.all(
				this.currentAgendaItems.map(async currentAgendaItem => {
					await Promise.all(
						this.agendaToCompareAgendaItems.map(async agendaItemToCompare => {
							if (await this.checkSubCaseIds(currentAgendaItem, agendaItemToCompare)) {
								await this.checkComparisonType(currentAgendaItem, agendaItemToCompare, newItems);
							} else {
								agendaItemToCompare.set('comparisonType', 'deleted')
								newItems.push(agendaItemToCompare)
							}
						}))
				}));

			this.set('comparedItems', newItems);
		}
	}),

	async checkSubCaseIds(currentAgendaItem, agendaItemToCompare) {
		let currentAgendaItemSubcase = await currentAgendaItem.subcase;
		let compareAgendaItemSubcase = await agendaItemToCompare.subcase;

		if (currentAgendaItemSubcase && compareAgendaItemSubcase) {
			if (currentAgendaItemSubcase.id === compareAgendaItemSubcase.id) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},

	checkComparisonType(currentAgendaItem, agendaItemToCompare, newItems) {
		if (currentAgendaItem.extended === agendaItemToCompare.extended) {
			currentAgendaItem.set('comparisonType', 'unchanged')
		} else {
			currentAgendaItem.set('comparisonType', 'extended')
		}
		newItems.push(currentAgendaItem);
	}
})
