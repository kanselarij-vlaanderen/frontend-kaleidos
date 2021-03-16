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
      if (controller.subcase) {
        // TODO: below query doesn't return the expected results. (returns none) To be investigated
        let governmentFields = this.store.query('government-field', {
          'filter[ise-code][subcases][:id:]': controller.subcase.id,
        });
        governmentFields = governmentFields.toArray();
        controller.governmentFields = governmentFields;
      }
    }
    const agendaItemTreatment = await model.treatments;
    const anyTreatment = agendaItemTreatment.firstObject;
    if (anyTreatment) {
      controller.newsletterInfo = await anyTreatment.newsletterInfo;
    }
  }
}
