import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
export default class SubcaseTitlesPanelView extends Component {
  @tracked approved;

  constructor() {
    super(...arguments);
    this.loadApproved.perform();
  }

  @task
  *loadApproved() {
    this.approved = yield this.args.subcase.approved;
  }

  get pillSkin(){
    if (this.approved) {
      return 'success';
    }
    return 'default';
  }
}
