
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
			return
		}

		const agendaitem = this.store.createRecord('agendaitem', {
			retracted: false,
			postPoned: null,
			created: new Date(),
			agenda: agenda,
			priority: 1,
			title: `De notulen kan u vinden op <a href="/overzicht/${closestMeeting.meeting_id}/notulen/${closestMeeting.agenda_id}."></a>`,
			shortTitle: `Goedkeuring notulen voor de vergadering van ${moment(new Date(closestMeeting.plannedstart)).format("dddd DD-MM-YYYY")}.`,
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
			const date = new Date();
			const startDate = this.get('startDate');
			const newMeeting = this.store.createRecord('meeting', {
				plannedStart: startDate,
				created: date
			});

			newMeeting.save().then(async (meeting) => {
				const agenda = await this.createAgenda(meeting, date);
				const closestMeeting = await this.agendaService.getClosestMeetingId(startDate);
				await this.createAgendaItemToApproveMinutes(agenda, closestMeeting);
				await this.agendaService.assignNewSessionNumbers();

				this.set('isLoading', false);
				this.successfullyAdded();
			});
		},

		async selectStartDate(val) {
			const closestMeeting = await this.agendaService.getClosestMeetingId(val)
			console.log(closestMeeting.agenda_id)
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
