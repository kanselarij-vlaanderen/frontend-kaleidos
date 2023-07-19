import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcaseDecisionRoute extends Route {
  @service store;
  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    const pieces = await this.store.query('report', {
      'filter[decision-activity][subcase][:id:]': subcase.id,
      sort: '-created',
    });
    return pieces.slice();
  }
}
