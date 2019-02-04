import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
	store: inject(),

	approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			session: currentSession
		});

		return new Promise((resolve, reject) => {
			newAgenda.save().then(agenda => {
				// Check if the agenda is `A` if true => serial numbers will be assigned.
				let renameDocuments = false;
				if(oldAgenda.name == "A") {
					renameDocuments = true;
				}
				$.ajax(
					{
						method: "POST",
						url: '/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id,
							renameDocuments: renameDocuments
						}
					}
				).then(() => {
					resolve(agenda);
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
			formallyOk: false,
			dateAdded: new Date(),
			subcase: subCase,
			agenda: selectedAgenda,
		});
		return new Promise((resolve, reject) => {
			agendaitem.save().then(agendaitem => {
				$.ajax(
					{
						method: "POST",
						url: `/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
						data: {
						}
					}
				).then(() => {
					// eslint-disable-next-line ember/jquery-ember-run
					selectedAgenda.notifyPropertyChange('agendaitems');
					resolve(agendaitem);
				}).catch(error => {
					reject(error);
				})
			});
		})
	},

});
