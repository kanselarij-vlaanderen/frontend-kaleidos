import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
	store: inject(),

	addAgendaToSession(currentSession, oldAgenda) {
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			session: currentSession
		});

		return new Promise((resolve, reject) => {
			newAgenda.save().then(agenda => {
				$.ajax(
					{
						method: "POST",
						url: 'http://localhost/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id
						}
					}
				).then(() => {
					resolve(newAgenda);
				}).catch(error => {
					reject(error);
				})
			});
		})
	},

	createNewAgendaItem(selectedAgenda, subCase) {
		let agendaitem = this.store.createRecord('agendaitem', {
			extended: false,
			priority: 100,
			formallyOk:false,
			dateAdded: new Date(),
			subcase: subCase,
			agenda: selectedAgenda,
		});
		return new Promise((resolve, reject) => {
			agendaitem.save().then(agendaitem => {
				$.ajax(
					{
						method: "POST",
						url: `http://localhost/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
						data: {
						}
					}
				).then(() => {
					resolve(agendaitem);
				}).catch(error => {
					reject(error);
				})
			});
		})
	}


});
