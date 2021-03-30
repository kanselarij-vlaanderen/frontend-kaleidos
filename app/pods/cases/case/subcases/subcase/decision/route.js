import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseDecisionRoute extends Route {
  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    const pieces = await this.store.query('piece', {
      'filter[agenda-item-treatment][subcase][:id:]': subcase.id,
      sort: '-created',
    });
    return pieces.toArray();
  }
}
