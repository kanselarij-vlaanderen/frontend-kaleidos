import Route from '@ember/routing/route';
import { animationFrame } from 'ember-concurrency';

export default class AgendaItemsAgendaRoute extends Route {
  queryParams = {
    anchor: {
      refreshModel: false,
    },
  };

  model() {
    return this.modelFor('agenda.agendaitems');
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.previousAgenda = await agenda.previousVersion;
    await controller.loadDocuments.perform();
    await controller.groupNotasOnGroupName.perform(model.notas);
    await animationFrame(); // make sure rendering has happened before trying to scroll
    controller.scrollToAnchor();
  }
}
