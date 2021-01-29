import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    controller.set('meeting', meeting);
    controller.set('agenda', agenda);

    controller.set('filteredNotas', model.notas);
    controller.set('filteredAnnouncements', model.announcements);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
