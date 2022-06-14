import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaitemDecisionEditComponent extends Component {
  @tracked treatment = this.args.agendaItemTreatment;

  @action
  changeDecisionResultCode(resultCode) {
    this.treatment.set('decisionResultCode', resultCode);
  }

  @task
  *saveTreatment() {
    yield this.treatment.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  }

  @action
  cancelEdit() {
    this.treatment.belongsTo('decisionResultCode').reload(); // "rollback relationship"
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    return this.treatment;
  }
}
