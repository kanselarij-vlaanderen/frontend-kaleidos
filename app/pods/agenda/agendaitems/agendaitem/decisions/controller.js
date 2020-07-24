import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @service store;

  @action
  async addDecision() {
    if (this.subcase) {
      const newDecision = this.store.createRecord('decision', {
        approved: false,
        subcase: this.subcase,
      });
      await newDecision.save();
      this.refresh();
    }
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
