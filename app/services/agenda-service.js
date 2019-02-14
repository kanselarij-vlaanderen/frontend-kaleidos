import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
	store: inject(),

	approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			createdFor: currentSession,
			created: new Date()
		});

		return new Promise((resolve, reject) => {
			newAgenda.save().then(agenda => {
				$.ajax(
					{
						method: "POST",
						url: '/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id,
							currentSessionDate: currentSession.plannedStart,
						}
					}
				).then(() => {
					// eslint-disable-next-line ember/jquery-ember-run
					agenda.notifyPropertyChange('agendaitems');
					resolve(agenda);
				}).catch(error => {
					reject(error);
				})
			});
		})
	},

	createNewAgendaItem(selectedAgenda, subCase) {
		let agendaitem = this.store.createRecord('agendaitem', {
			retracted: false,
			postPoned: false,
			formallyOk: false,
			created: new Date(),
			subcase: subCase,
			agenda: selectedAgenda,
			priority: -1
		});
		return new Promise((resolve, reject) => {
			agendaitem.save().then(agendaitem => {
				$.ajax(
					{
						method: "POST",
						url: `/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
						data: { }
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
