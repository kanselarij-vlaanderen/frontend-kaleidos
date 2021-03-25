import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async afterModel(model) {
    this.allSubcases = await model.subcasesFromCase;
    // Below fetching of government-fields, could be rewritten shorter as
    // let governmentFields = await this.store.query('government-field', {
    //   'filter[ise-code][subcases][:id:]': controller.subcase.id,
    // });
    // This however results in a request that once in mu-cache, doesn't get invalidated properly.
    // mu-cl-resources:1.20.0
    // Querying the ise-codes with fields included, is used as a workaround.
    const iseCodes = await this.store.query('ise-code', {
      'filter[subcases][:id:]': model.id,
      include: 'field', // FIXME: singular naming of a n-relationship
    });
    let governmentFields = [];
    for (const iseCode of iseCodes.toArray()) {
      const fieldForCode = await iseCode.field;
      governmentFields.push(fieldForCode);
    }
    governmentFields = [...new Set(governmentFields)]; // Uniquify
    this.governmentFields = governmentFields;
    this.mandatees = (await model.mandatees).sortBy('priority');
    this.submitter = await model.requestedBy;
    this.iseCodes = await model.iseCodes;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.allSubcases = this.allSubcases;
    controller.governmentFields = this.governmentFields;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.iseCodes = this.iseCodes;
  }
}
