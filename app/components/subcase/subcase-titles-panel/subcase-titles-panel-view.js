import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class SubcaseTitlesPanelView extends Component {
  @service subcaseIsApproved;

  @tracked approved;

  constructor() {
    super(...arguments);
    this.loadApproved.perform();
  }

  @task
  *loadApproved() {
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
  }

  get pillSkin(){
    if (this.approved) {
      return 'success';
    }
    return 'default';
  }
}
