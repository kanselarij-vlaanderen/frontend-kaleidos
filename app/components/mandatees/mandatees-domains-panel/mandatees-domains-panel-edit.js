import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class MandateesMandateesDomainsPanelEditComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument onAddMandatee
   * @argument onRemoveMandatee
   * @argument onChangeSubmitter: The submitter is at least 0 people and at most 1 person per item. Hands <Mandatee> or null to the action
   * @argument onCancel
   * @argument onSave
   */
  @tracked isShowingAddMandateeModal = false;

  @action
  showAddMandateeModal() {
    this.isShowingAddMandateeModal = true;
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(this.mandateesBuffer);
    }
    this.isEditing = false;
    this.mandateesBuffer = [];
  }

  @action
  toggleIsSubmitter(mandatee, flag) {
    if (this.args.onChangeSubmitter) {
      this.args.onChangeSubmitter(flag ? mandatee : null);
    }
  }
}
