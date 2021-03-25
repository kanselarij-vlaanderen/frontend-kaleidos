import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    return this.modelFor('agenda.agendaitems.agendaitem');
  }

  async afterModel(model) {
    this.agendaActivity = await model.agendaActivity;
    if (this.agendaActivity) {
      this.subcase = await this.agendaActivity.subcase;
      if (this.subcase) {
        // Below fetching of government-fields, could be rewritten shorter as
        // let governmentFields = await this.store.query('government-field', {
        //   'filter[ise-code][subcases][:id:]': controller.subcase.id,
        // });
        // This however results in a request that once in mu-cache, doesn't get invalidated properly.
        // mu-cl-resources:1.20.0
        // Querying the ise-codes with fields included, is used as a workaround.
        this.iseCodes = await this.store.query('ise-code', {
          'filter[subcases][:id:]': this.subcase.id,
          include: 'field', // FIXME: singular naming of a n-relationship
        });
        let governmentFields = [];
        for (const iseCode of this.iseCodes.toArray()) {
          const fieldForCode = await iseCode.field;
          governmentFields.push(fieldForCode);
        }
        governmentFields = [...new Set(governmentFields)]; // Uniquify
        this.governmentFields = governmentFields;

        this.submitter = await this.subcase.requestedBy;
      }
    }
    const agendaItemTreatment = await model.treatments;
    const anyTreatment = agendaItemTreatment.firstObject;
    if (anyTreatment) {
      this.newsletterInfo = await anyTreatment.newsletterInfo;
    }
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.agenda = this.modelFor('agenda');
    controller.agendaActivity = this.agendaActivity;
    controller.subcase = this.subcase;
    controller.governmentFields = this.governmentFields;
    controller.iseCodes = this.iseCodes;
    controller.newsletterInfo = this.newsletterInfo;
    controller.submitter = this.submitter;
  }
}
