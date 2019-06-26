import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
import EmberObject from '@ember/object';

export default Service.extend({
	store: inject(),

	assignNewSessionNumbers() {
		return $.ajax(
			{
				method: "GET",
				url: `/session-service/assignNewSessionNumbers`
			}
		);
	},

	getClosestMeetingAndAgendaId(date) {
		return $.ajax(
			{
				method: "GET",
				url: `/session-service/closestMeeting?date=${date}`
			}
		).then((result) => {
			return result.body.closestMeeting;
		});
	},

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

	sendNewsletter(agenda) {
		return $.ajax(
			{
				method: "GET",
				url: `/newsletter/mails?agendaId=${agenda.get('id')}`,
			}
		);
	},

	async reduceAgendaitemsByMandatees(agendaitems) {
		return agendaitems.reduce((items, agendaitem) => {
			let mandatees = agendaitem.get('subcase.mandatees');
			if (mandatees) {
				mandatees = mandatees.sortBy('priority')
			}
			let titles = (mandatees || []).map((mandatee) => mandatee.title);
			if (titles && titles != []) {
				titles = titles.join(',');
				items[titles] = items[titles] || { groupName: titles, mandatees: mandatees, agendaitems: [], foundPriority: agendaitem.foundPriority };
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
			created: moment().utc().toDate(),
			modified: moment().utc().toDate()
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
				notifyPropertyChange(agenda, 'agendaitems');
				return agenda;
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

	newSorting(sessionId, currentAgendaID) {
		return $.ajax(
			{
				method: "GET",
				url: `/agenda-sort/sortedAgenda?sessionId=${sessionId.get('id')}&selectedAgenda=${currentAgendaID}`,
				data: {}
			}
		).then((result) => {
			return result.map((item) => {
				item.groups = item.groups.map((group) => EmberObject.create(group))
				return EmberObject.create(item);
			} );
		});
	},

	async createNewAgendaItem(selectedAgenda, subcase) {
		const mandatees = await subcase.get('mandatees');
		const titles = mandatees.map((mandatee) => mandatee.get('title'));
		const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`

		const agendaitem = this.store.createRecord('agendaitem', {
			retracted: false,
			postPoned: null,
			titlePress: subcase.get('shortTitle'),
			textPress: pressText,
			created: moment().utc().toDate(),
			subcase: subcase,
			agenda: selectedAgenda,
			priority: null,
			title: subcase.get('title'),
			shortTitle: subcase.get('shortTitle'),
			formallyOk: CONFIG.notYetFormallyOk,
			showAsRemark: subcase.get('showAsRemark'),
			mandatees: mandatees,
			documentVersions: await subcase.get('documentVersions'),
			themes: await subcase.get('themes'),
			approvals: await subcase.get('approvals')
		});
		return agendaitem.save();
	},

	parseGroups(groups, agendaitems) {
		let lastPrio = 0;
		let firstAgendaItem;
		groups.map((agenda) => {
			agenda.groups.map((group) => {
				
				const newAgendaitems = group.agendaitems.map((item) => {
					const foundItem = agendaitems.find((agendaitem) => item.id === agendaitem.get('id'));

					if (!firstAgendaItem) {
						firstAgendaItem = foundItem;
					}
					if (foundItem && foundItem.get('priority')) {
						lastPrio = foundItem.priority;
					} else {
						if (foundItem) {
							foundItem.set('priority', parseInt(lastPrio) + 1)
						}
					}

					return foundItem;
				})
				group.agendaitems = newAgendaitems.filter((item) => item).sortBy('priority');

				if (group.agendaitems.get('length') < 1) {
					group.agendaitems = 0;
					group = null;
				}

			})
		});
		return { lastPrio, firstAgendaItem };
	},
});
