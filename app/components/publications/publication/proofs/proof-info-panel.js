import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {PublicationSubcase}
 * @argument {onSave}
 */
export default class PublicationsPublicationProofsProofInfoPanelComponent extends Component {
  @service store;

  @tracked isEditing = false;

  @tracked proofPrintCorrector;
  @tracked dueDate;

  constructor() {
    super(...arguments);
    this.initFields();
  }

  async initFields() {
    this.proofPrintCorrector = this.args.publicationSubcase.proofPrintCorrector;
    this.dueDate = this.args.publicationSubcase.dueDate;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
    this.initFields();
  }

  @action
  setPublicationDueDate(selectedDates) {
    this.dueDate = selectedDates[0];
  }

  @task
  *save() {
    yield this.performSave();
    this.isEditing = false;
  }

  async performSave() {
    const publicationSubcase = this.args.publicationSubcase;
    publicationSubcase.dueDate = this.dueDate;
    publicationSubcase.proofPrintCorrector = this.corrector;

    await publicationSubcase.save();
  }
}
