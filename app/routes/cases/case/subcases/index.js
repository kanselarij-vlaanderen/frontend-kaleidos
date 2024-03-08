import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesIndexRoute extends Route {
  @service router;

  async redirect(model) {
    const selectedSubcase = await model.get('lastObject');
    this.router.replaceWith('cases.case.subcases.subcase', selectedSubcase.id);
  }
}
