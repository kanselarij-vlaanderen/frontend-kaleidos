import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaitemDecisionEditComponent extends Component {
  @tracked decisionResultCode;

  constructor() {
    super(...arguments);
    this.loadDecisionActivityResult.perform();
  }

  loadDecisionActivityResult = task(async () => {
    this.decisionResultCode = await this.args.decisionActivity?.decisionResultCode;
  });

  @action
  changeDecisionResultCode(resultCode) {
    this.decisionResultCode = resultCode;
  }

  saveDecisionActivity = task(async () => {
    this.args.decisionActivity.decisionResultCode = this.decisionResultCode;
    await this.args.decisionActivity.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  });

  @action
  cancelEdit() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }
}
