import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    return this.modelFor('agenda.agendaitems.agendaitem');
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
    } = this.modelFor('agenda');
    controller.agenda = agenda;
    const agendaActivity = await model.agendaActivity;
    if (agendaActivity) {
      controller.subcase = await agendaActivity.subcase;
    }
    const agendaItemTreatment = await model.treatments;
    const anyTreatment = agendaItemTreatment.firstObject;
    if (anyTreatment) {
      controller.newsletterInfo = await anyTreatment.newsletterInfo;
    }
  }
}
