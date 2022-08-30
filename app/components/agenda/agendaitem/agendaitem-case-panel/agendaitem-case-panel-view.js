import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsletterInfo
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  @tracked case;

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
