import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';
export default Component.extend({
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	currentAgenda: null,
	agendaitem: null,
	lastDefiniteAgenda: null,

	currentMeeting: computed('currentAgenda.createdFor', function () {
		return this.currentAgenda.get('createdFor');
	}),

	meetings: computed('currentMeeting', function () {
		const currentMeetingDate = this.currentMeeting.get('plannedStart')
		const dateOfToday = moment(currentMeetingDate).utc().format();
		const dateInTwoWeeks = moment().utc().add(6, 'weeks').format();

		return this.store.query('meeting', {
			filter: {
				':gt:planned-start': dateOfToday,
				':lte:planned-start': dateInTwoWeeks,
				'is-final': false
			},
			sort: 'planned-start'
		})
	}),

	isPostPonable: computed('sessionService.agendas.@each', function () {
		return this.get('sessionService.agendas').then(agendas => {
			if (agendas && agendas.get('length') > 1) {
				return true;
			} else {
				return false;
			}
		})
	}),

	isDeletable: computed('agendaitem', 'agendaitem.subcase', 'lastDefiniteAgenda.agendaitems.@each', 'currentAgenda', async function () {
		const currentAgendaName = await this.get('currentAgenda.name');
		const agendaitem = await this.agendaitem;
		const lastDefiniteAgenda = await this.lastDefiniteAgenda;

		if (!lastDefiniteAgenda) {
			return true;
		}
		if (currentAgendaName != "Ontwerpagenda") {
			return false;
		}
		const agendaitems = await lastDefiniteAgenda.get('agendaitems');
		const agendaitemSubcase = await agendaitem.get('subcase');

		let agendaitemNotInDefiniteAgenda = true;

		await Promise.all(agendaitems.map(item => {
			return item.get('subcase').then((subcase) => {
				if (!subcase || !agendaitemSubcase) {
					return;
				}
				if (agendaitemSubcase.id == subcase.id) {
					agendaitemNotInDefiniteAgenda = false;
				}
			})
		}));

		return agendaitemNotInDefiniteAgenda;
	}),

	actions: {
		showOptions() {
			this.toggleProperty('showOptions');
		},

		async postponeAgendaItem(agendaitem, meetingToPostponeTo) {
			agendaitem.set('retracted', true);

			const postPonedObject = this.store.createRecord('postponed', {
				agendaitem: agendaitem,
				meeting: meetingToPostponeTo
			});

			if (meetingToPostponeTo) {
				const subcase = await agendaitem.get('subcase');
				const agenda = await meetingToPostponeTo.get('latestAgenda');
				if (agenda.get('name') == 'Ontwerpagenda' && subcase) {
					await this.agendaService.createNewAgendaItem(agenda, subcase);
					await agenda.hasMany('agendaitems').reload();
				}
			}

			postPonedObject.save().then(postponedTo => {
				agendaitem.set('postponed', postponedTo);
			});

			await agendaitem.save();
			await agendaitem.reload();
		},

		async advanceAgendaitem() {
			const agendaitem = await this.store.findRecord('agendaitem', this.agendaitem.get('id'));
			if (agendaitem && agendaitem.retracted) {
				agendaitem.set('retracted', false);
			}
			const postponedTo = await agendaitem.get('postponedTo');
			if (agendaitem && postponedTo) {
				await postponedTo.destroyRecord();
			}
			await agendaitem.save();
			await agendaitem.reload();
		},

		async deleteItem(agendaitem) {
			const id = agendaitem.get('id');
			const itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'));
		
			// const subcase = await this.get('subcase');
			// if (subcase) {
			// 	const phases = await subcase.get('phases');
			// 	await Promise.all(phases.filter(async phase => {
			// 		const code = await phase.get('code');
			// 		if (!code || code.get('label') == "Ingediend voor agendering") {
			// 			await phase.destroyRecord();
			// 		} else {
			// 			return phase;
			// 		}
			// 	}))
			// 	subcase.set('requestedForMeeting', null);
			// 	subcase.save();
			// }

			const agenda = await this.store.findRecord('agenda', await agendaitem.get('agenda.id'))

			itemToDelete.destroyRecord().then(() => {
				agenda.hasMany('agendaitems').reload();
				this.set('sessionService.selectedAgendaItem', null);
				this.refreshRoute(id);
			});
		},
	}
});