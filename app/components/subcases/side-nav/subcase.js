import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SubcaseSideNavSubcaseComponent extends Component {

  /**
   * @argument subcase
   * @argument label: the label to be displayed. Depends on the subcase.type
   */
  @service store;

  @tracked decisionResultCode;
  @tracked decisionActivity;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.decisionActivity = yield this.store.queryOne('decision-activity', {
      'filter[treatment][agendaitems][agenda-activity][subcase][:id:]': this.args.subcase.id
    })
    this.decisionResultCode = yield this.decisionActivity?.decisionResultCode;

  }



}