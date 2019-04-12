import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';

export default Service.extend({
	store: inject(),

	getSortedAgendaItems(agenda) {
		return $.ajax(
			{
				method: "GET",
				url: `/agenda-sort?agendaId=${agenda.get('id')}`,
			}
		).then(result => {
			return result.body.items;
		})
	},

	reduceAgendaitemsByMandatees(agendaitems) {
		return agendaitems.reduce((items, agendaitem) => {
			const mandatees = agendaitem.get('subcase').get('mandatees').sortBy('priority');
			let titles = mandatees.map((mandatee) => mandatee.title);
			if (titles && titles != []) {
				titles = titles.join(',');
				items[titles] = items[titles] || { groupName: titles, mandatees:mandatees, agendaitems: [], foundPriority: agendaitem.foundPriority };
				items[titles].foundPriority = Math.min(items[titles].foundPriority, agendaitem.foundPriority);
				items[titles].agendaitems.push(agendaitem);
				return items;
			}
		}, {});
	},

	approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			createdFor: currentSession,
			created: new Date()
		});

		return newAgenda.save().then(agenda => {
			if (oldAgenda) {
				return $.ajax(
					{
						method: "POST",
						url: '/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id,
						}
					}
				);
			} else {
				notifyPropertyChange(newAgenda, 'agendaitems');
				return newAgenda;
			}
		}).then(() => {
			notifyPropertyChange(newAgenda, 'agendaitems');
			return newAgenda;
		});
	},

	sortAgendaItems(selectedAgenda) {
		return $.ajax(
			{
				method: "POST",
				url: `/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
				data: {}
			}
		).then(() => {
			notifyPropertyChange(selectedAgenda, 'agendaitems');
		});
	},

	createNewAgendaItem(selectedAgenda, subCase) {
		let agendaitem = this.store.createRecord('agendaitem', {
			retracted: false,
			postPoned: false,
			titlePress: subCase.shortTitle,
			created: new Date(),
			subcase: subCase,
			agenda: selectedAgenda,
			priority: null
		});
		return agendaitem.save().then(agendaitem => {
			notifyPropertyChange(selectedAgenda, 'agendaitems');
			return agendaitem;
		});
	},

});
