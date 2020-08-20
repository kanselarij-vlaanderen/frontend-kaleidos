import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;

  @tracked isEditing = false;

  @tracked isVerifyingDelete = null;

  @tracked decisionToDelete = null;

  get decision() {
    return this.args.decision;
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

  @action
  promptDeleteDecision(decision) {
    this.decisionToDelete = decision;
    this.isVerifyingDelete = true;
  }

  @action
  async deleteDecision() {
    await this.decisionToDelete.destroyRecord();
    if (this.args.onDeleteDecision) {
      await this.args.onDeleteDecision(this.decisionToDelete);
    }
    this.isVerifyingDelete = false;
  }

  @action
  cancel() {
    this.decisionToDelete = null;
    this.isVerifyingDelete = false;
  }
}
