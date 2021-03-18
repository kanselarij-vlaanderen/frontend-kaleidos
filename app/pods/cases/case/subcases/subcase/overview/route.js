import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async afterModel(model) {
    this.allSubcases = await model.subcasesFromCase;
    const governmentFields = await this.store.query('government-field', {
      'filter[ise-code][subcases][:id:]': model.id,
    });
    this.governmentFields = governmentFields.toArray();
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.allSubcases = this.allSubcases;
    controller.governmentFields = this.governmentFields;
  }
}
