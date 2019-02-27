import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';

export default Service.extend({
	store: inject(),

	approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			createdFor: currentSession,
			created: new Date()
		});

		return newAgenda.save().then(agenda => {
			if(oldAgenda) {
				return $.ajax(
					{
						method: "POST",
						url: '/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id,
							currentSessionDate: currentSession.plannedStart,
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
			formallyOk: false,
			titlePress: subCase.shortTitle || subCase.title,
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
