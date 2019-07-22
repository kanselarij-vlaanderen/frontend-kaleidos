import Route from '@ember/routing/route';
import SortedAgendaItemsRouteMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';
import { hash } from 'rsvp';
import { isEmpty} from '@ember/utils';
import $ from 'jquery';
import iseCode from '../../models/ise-code';


export default Route.extend(SortedAgendaItemsRouteMixin, {
	queryParams: {
		filter: { refreshModel: true },
		refresh: { refreshModel: true }
	},

	async model(params) {
		
	  const {agenda,matchingAgendaItems} = await hash({
			agenda: this.store.findRecord('agenda', await this.get('sessionService.currentAgenda.id')),
			matchingAgendaItems: this.matchingAgendaItems(params.filter)
		});
		this.set('sessionService.selectedAgendaItem', null);
		const session = this.modelFor('agenda');

		const { groups, firstAgendaItem, announcements, lastPrio, minutesApproval } = await this.parseAgendaItems(agenda, session, null);
		if (minutesApproval) {
			this.set('sessionService.firstAgendaItemOfAgenda', minutesApproval);
		} else {
			this.set('sessionService.firstAgendaItemOfAgenda', firstAgendaItem);
		}

		let filteredGroups = groups;
		if(!isEmpty(params.filter)){
			filteredGroups = this.filterAgendaGroups(groups, matchingAgendaItems);
		}
		return hash({
			currentAgenda: agenda,
			groups: filteredGroups,
			announcements,
			lastPrio,
			minutesApproval
		});
	},

	matchingAgendaItems: async function(filter) {
		if(isEmpty(filter)){
			return {};
		}
		const agendaId = this.get('sessionService.currentAgenda.id');
		const searchResults = await $.ajax(
      {
        method: "GET",
        url: `/agendaitems/search?filter[agendaId]=${agendaId}&filter[data,title,shortTitle,titlePress,textPress,mandateeName,theme]=${filter}&page[size]=2000`
      }
		);
		const searchMap = {};
		searchResults.data.map((item) => {
			searchMap[item.id] = true;
		});
		return searchMap;
	},

	filterAgendaGroups: function(groups, matchingAgendaItems){
		groups.map((agenda) => {
			agenda.groups.map((group) => {
				group.agendaitems = group.agendaitems.filter((item) => {
					return matchingAgendaItems[item.get('id')];
				})
			})

			agenda.groups = agenda.groups.filter((group) => {
				return group.agendaitems.length > 0;
			});
		});

		groups = groups.filter((agenda) => {
			return agenda.groups.length > 0;
		});
		return groups;
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
