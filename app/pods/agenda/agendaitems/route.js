import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { ajax } from 'fe-redpencil/utils/ajax';
import { inject } from '@ember/service';
import { action } from '@ember/object';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),
  queryParams: {
    filter: {
      refreshModel: true,
    },
  },

  async model(params) {
    const {
      agenda,
    } = this.modelFor('agenda');
    let agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: 'mandatees',
    });
    if (!isEmpty(params.filter)) {
      const matchingAgendaitems = await this.getMatchingAgendaitems(params.filter);
      agendaitems = agendaitems.filter((item) => matchingAgendaitems[item.id]);
    }

    const announcements = agendaitems.filter((item) => item.showAsRemark);

    this.set('sessionService.selectedAgendaitem', null);

    return hash({
      currentAgenda: agenda,
      announcements,
      agendaitems,
    });
  },

  @action
  reloadModel() {
    this.refresh();
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
