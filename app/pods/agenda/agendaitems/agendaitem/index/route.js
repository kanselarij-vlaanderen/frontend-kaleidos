import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.findRecord('agendaitem', agendaItem.id, {
      // TODO: assess which data we want to load here, and which data we want to sideload in the
      // different panel-components (when those get refactored for data-loading). At least the mandatees
      // need to be reloaded here (from the backend), since the overview only loads a few mandatee-fields for efficfiency
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.type',
        'agenda-activity.subcase.mandatees'
      ].join(','),
    });
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
    const agendaItemTreatment = await model.hasMany('treatments').reload();
    const anyTreatment = agendaItemTreatment.firstObject;
    if (anyTreatment) {
      this.newsletterInfo = await anyTreatment.newsletterInfo;
    }
    // When routing here from agenda overview with stale data, we need to reload several relations
    // The reload in model refreshes only the attributes and includes relations, makes saves with stale relation data possible
    await model.hasMany('mandatees').reload();
    await model.hasMany('pieces').reload();
    this.mandatees = (await model.mandatees).sortBy('priority');
  }

  async setupController(controller) {
    super.setupController(...arguments);
    // modelFor('agenda') contains agenda and meeting object.
    controller.agenda = this.modelFor('agenda').agenda;
    controller.agendaActivity = this.agendaActivity;
    controller.subcase = this.subcase;
    controller.governmentFields = this.governmentFields;
    controller.iseCodes = this.iseCodes;
    controller.newsletterInfo = this.newsletterInfo;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
  }
}
