import Route from '@ember/routing/route';
import SortedAgendaItemsRouteMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';
import { hash } from 'rsvp';

export default Route.extend(SortedAgendaItemsRouteMixin, {
	queryParams: {
		filter: { refreshModel: true },
		refresh: { refreshModel: true }
	},

	async model() {
		const agenda = await this.get('sessionService.currentAgenda');
		this.set('sessionService.selectedAgendaItem', null);
		const session = this.modelFor('agenda');

		const { groups, firstAgendaItem, announcements, lastPrio } = await this.parseAgendaItems(agenda, session);

		this.set('sessionService.firstAgendaItemOfAgenda', firstAgendaItem);

		return hash({
			currentAgenda: agenda,
			groups,
			announcements,
			lastPrio
		});
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
