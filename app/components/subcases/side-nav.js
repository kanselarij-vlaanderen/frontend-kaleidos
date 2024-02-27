import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SubcaseSideNavComponent extends Component {
  @service intl;

  @action
  async calculateDisplayLabel(subcaseId) {
    const subcases = this.args.subcases.slice();
    const subcase = subcases.find((subcase) => subcase.id === subcaseId);
    const number = subcases.indexOf(subcase);
    const subcaseType = await subcase.type;
    if (subcaseType) {
      const label = await subcaseType.label;
      return label;
    } else {
      return this.intl.t("step-and-number", {number: number+1})
    }
  }
}