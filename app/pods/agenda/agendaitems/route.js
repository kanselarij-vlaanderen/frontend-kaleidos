import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class AgendaItemsAgendaRoute extends Route {
  queryParams = {
    filter: {
      refreshModel: false,
    },
  };

  @service sessionService;
  @service agendaService;

  async model() {
    const {
      agenda,
    } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: 'mandatees',
      'page[size]': CONFIG.MAX_PAGE_SIZE.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    this.set('sessionService.selectedAgendaitem', null);

    return hash({
      notas,
      announcements,
    });
  }

  afterModel(_, transition) { // eslint-disable-line
    if (!isEmpty(transition.to.queryParams.filter)) {
      const controller = this.controllerFor('agenda.agendaitems');
      controller.filterTask.perform();
    }
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.filteredNotas = model.notas;
    controller.filteredAnnouncements = model.announcements;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
