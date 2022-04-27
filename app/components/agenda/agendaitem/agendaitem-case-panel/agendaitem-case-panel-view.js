import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument newsletterInfo
 * @argument shouldShowDetails - shouldShowDetails should only be false when the agendaitem is to approve minutes
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  @tracked case;
  @tracked showLoader = false;

  constructor() {
    super(...arguments);
    this.loadCase.perform();
  }

  @task
  *loadCase() {
    if (this.args.subcase) {
      this.case = yield this.args.subcase.case;
    }
  }
}
