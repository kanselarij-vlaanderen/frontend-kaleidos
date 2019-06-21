
import Component from '@ember/component';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	agendaService: inject(),

	createAgenda(meeting, date) {
		const agenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda",
			createdFor: meeting,
			created: date,
			modified: date
		});

		return agenda.save();
	},

	createAgendaItemToApproveMinutes(agenda, closestMeeting) {
		if (!closestMeeting) {
			return;
		}

		const agendaitem = this.store.createRecord('agendaitem', {
			retracted: false,
			postPoned: null,
			created: moment().utc().toDate(),
			agenda: agenda,
			priority: 1,
			title: `${closestMeeting.meeting_id}/${closestMeeting.agenda_id}`,
			shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(closestMeeting.plannedstart).utc().format("dddd DD-MM-YYYY")}.`,
			formallyOk: CONFIG.notYetFormallyOk,
			mandatees: [],
			documentVersions: [],
			themes: [],
			approvals: []
		});
		return agendaitem.save();
	},

	actions: {
		async createNewSession() {
			this.set('isLoading', true);
			const date = moment().utc().toDate();
			const startDate = this.get('startDate');
			const newMeeting = this.store.createRecord('meeting', {
				plannedStart: startDate,
				created: date
			});
			const closestMeeting = await this.agendaService.getClosestMeetingAndAgendaId(startDate);

			newMeeting.save().then(async (meeting) => {
				const agenda = await this.createAgenda(meeting, date);
				await this.createAgendaItemToApproveMinutes(agenda, closestMeeting);
				await this.agendaService.assignNewSessionNumbers();

				this.set('isLoading', false);
				this.successfullyAdded();
			});
		},

		async selectStartDate(val) {
			this.set('startDate', val);
		},

		cancelForm(event) {
			this.cancelForm(event);
		},

		successfullyAdded() {
			this.successfullyAdded();
		}
	}
});
