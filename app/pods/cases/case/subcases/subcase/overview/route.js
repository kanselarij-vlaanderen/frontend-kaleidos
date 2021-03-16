import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async setupController(controller, model) {
    super.setupController(...arguments);
    controller.allSubcases = await model.subcasesFromCase;
    // TODO: below query doesn't return the expected results. (returns none) To be investigated
    let governmentFields = this.store.query('government-field', {
      'filter[ise-code][subcases][:id:]': model.id,
    });
    governmentFields = governmentFields.toArray();
    controller.governmentFields = governmentFields;
  }
}
