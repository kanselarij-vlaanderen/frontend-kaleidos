import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { ajax } from 'fe-redpencil/utils/ajax';
import { inject } from '@ember/service';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),
  queryParams: {
    filter: {
      refreshModel: true,
    },
    refresh: {
      refreshModel: true,
    },
  },

  async model(params) {
    const id = await this.get('sessionService.currentAgenda.id');
    if (id) {
      const {
        agenda, matchingAgendaitems,
      } = await hash({
        agenda: this.store.findRecord('agenda', id),
        matchingAgendaitems: this.getMatchingAgendaitems(params.filter),
      });

      let agendaitems = await this.store.query('agendaitem', {
        filter: {
          agenda: {
            id,
          },
        },
        include: 'mandatees',
      });
      if (!isEmpty(params.filter)) {
        agendaitems = agendaitems.filter((item) => matchingAgendaitems[item.id]);
      }

      const announcements = agendaitems.filter((item) => item.showAsRemark);

      this.set('sessionService.selectedAgendaitem', null);

      return hash({
        currentAgenda: agenda,
        announcements,
        agendaitems,
      });
    }
  },

  async getMatchingAgendaitems(filter) {
    if (isEmpty(filter)) {
      return {};
    }
    const meetingId = await this.get('sessionService.currentSession.id');
    const searchResults = await ajax({
      method: 'GET',
      url: `/agendaitems/search?filter[meetingId]=${meetingId}&filter[:sqs:title,shortTitle,data,titlePress,textPress,mandateeName,theme]=${filter}&page[size]=2000`,
    });
    const searchMap = {};
    searchResults.data.map((item) => {
      searchMap[item.id] = true;
    });
    return searchMap;
  },
});
