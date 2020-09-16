import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import search from 'fe-redpencil/utils/mu-search';

export default class AgendaItemsAgendaRoute extends Route {
  queryParams = {
    filter: {
      refreshModel: true,
    },
  };

  @service sessionService;
  @service agendaService;

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
      agendaitems = agendaitems.filter((agendaitem) => matchingAgendaitems.find((matchItem) => matchItem.id === agendaitem.id));
    }

    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    this.set('sessionService.selectedAgendaitem', null);

    return hash({
      currentAgenda: agenda,
      announcements,
      agendaitems,
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }

  async getMatchingAgendaitems(filterText) {
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    const filter = {
      ':sqs:title,shortTitle': filterText,
      meetingId: meeting.id,
      agendaId: agenda.id,
    };
    const matchingAgendaitems = await search('agendaitems', 0, 500, null, filter, (agendaitem) => {
      const entry = agendaitem.attributes;
      entry.id = agendaitem.id;
      return entry;
    });
    return matchingAgendaitems;
  }
}
