import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaitemDecisionEditComponent extends Component {
  @tracked decisionActivity = this.args.decisionActivity;

  @action
  changeDecisionResultCode(resultCode) {
    this.decisionActivity.set('decisionResultCode', resultCode);
  }

  @task
  *saveDecisionActivity() {
    yield this.decisionActivity.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  }

  @action
  cancelEdit() {
    this.decisionActivity.belongsTo('decisionResultCode').reload(); // "rollback relationship"
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    return this.decisionActivity;
  }
}
