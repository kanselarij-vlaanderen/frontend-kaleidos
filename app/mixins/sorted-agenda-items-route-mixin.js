import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import EmberObject from '@ember/object';

export default Mixin.create({
	sessionService: inject(),
	agendaService: inject(),

	async parseAgendaItems(agenda, session, definite) {
		const agendaitems = (await agenda.get('agendaitems')).filter((item) => item);
		const agendaitemsToGroup = agendaitems.filter((item) => !item.get('showAsRemark'));
		await this.agendaService.assignDirtyPrioritiesToAgendaitems(agenda);
		const announcements = agendaitems.filter((item) => item.get('showAsRemark'));
		const groups = await this.agendaService.newSorting(session, agenda.get('id'));

		const { lastPrio, firstAgendaItem } = await this.agendaService.parseGroups(groups, agendaitemsToGroup);
		const minutesApprovals = await Promise.all(agendaitems.map(async (agendaitem) => {
			const subcase = await agendaitem.get('subcase');
			if (!subcase && !agendaitem.get('showAsRemark')) {
				return agendaitem;
			}
		}));

		const minutesApproval = minutesApprovals.filter((item) => item).get('firstObject');
		return { groups, firstAgendaItem, announcements, lastPrio, minutesApproval };
	},

	async model(params) {
		const definite = params.definite;
		const session = await this.modelFor('print-overviews');
		const agenda = await this.modelFor(`print-overviews.${this.type}`);
		const { groups, announcements, lastPrio, minutesApproval } = await this.parseAgendaItems(agenda, session, definite);

		const groupsArray = groups.map((item) => EmberObject.create(item));
		return hash({
			currentAgenda: agenda,
			groups: groupsArray,
			announcements,
			lastPrio,
			meeting: session,
			minutesApproval
		});
	},
});
