import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {PublicationSubcase}
 * @argument {PublicationFlow}
 * @argument {onSave}
 */
export default class PublicationsPublicationProofsProofInfoPanelComponent extends Component {
  @service store;

  @tracked isEditing = false;
  @tracked proofPrintCorrector;
  @tracked publicationStatus;

  @tracked dueDate;

  constructor() {
    super(...arguments);
    this.loadStatus.perform();
  }

  @task
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.proofPrintCorrector = this.args.publicationSubcase.proofPrintCorrector;
    this.dueDate = this.args.publicationSubcase.dueDate;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
  }

  @action
  setPublicationDueDate(selectedDates) {
    this.dueDate = selectedDates[0];
  }

  @task
  *save() {
    yield this.args.onSave({
      dueDate: this.dueDate,
      corrector: this.proofPrintCorrector
    });
    this.isEditing = false;
  }
}
