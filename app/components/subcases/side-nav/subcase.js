import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';

export default class SubcaseSideNavSubcaseComponent extends Component {
  /**
   * @argument subcase
   * @argument label: the label to be displayed. Depends on the subcase.type
   */
  @service store;
  @service intl;

  @tracked decisionResultCode;
  @tracked decisionActivity;
  @tracked label;

  constructor() {
    super(...arguments);
    if (isEmpty(this.args.number)) {
      throw new Error('@number is required');
    }

    this.loadData.perform();
    this.loadLabel();
  }

  loadData = task(async () => {
    this.decisionActivity = await this.store.queryOne('decision-activity', {
      'filter[treatment][agendaitems][agenda-activity][subcase][:id:]':
        this.args.subcase.id,
    });
    this.decisionResultCode = await this.decisionActivity?.decisionResultCode;
  });

  loadLabel = async () => {
    const subcaseType = await this.args.subcase.type;
    if (subcaseType) {
      this.label = await subcaseType.label;
    } else {
      this.label = this.intl.t('step-and-number', {
        number: this.args.number + 1,
      });
    }
  };
}
