import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AgendaAgendaitemApproved extends Component {
  /**
   * @argument case
   * @argument subcase
   */

  @service store;
  @service subcasesService;
  @service subcaseIsApproved;

  @tracked approved; // or acknowledged

  constructor() {
    super(...arguments);
    this.loadSubcaseIsApproved.perform();
  }

  @task
  *loadSubcaseIsApproved() {
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
  }
}
