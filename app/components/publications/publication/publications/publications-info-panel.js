import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {publicationSubcase}
 * @argument {PublicationFlow}
 * @argument {onSave}
 */
export default class PublicationsPublicationPublicationsPublicationInfoPanel extends Component {
  @service store;

  @tracked isEditing = false;
  @tracked publicationStatus;
  @tracked publicationModes;


  @tracked mode;
  @tracked targetEndDate;


  constructor() {
    super(...arguments);
    this.loadStatus.perform();
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
  }

  @task
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.targetEndDate = this.args.publicationSubcase.targetEndDate;
    this.mode = this.args.publicationFlow.mode;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
  }

  @action
  setTargetEndDate(selectedDates) {
    this.targetEndDate = selectedDates[0];
  }

  @action
  setPublicationMode(publicationMode) {
    this.mode = publicationMode;
  }

  @task
  *save() {
    yield this.args.onSave({
      mode: this.mode,
      targetEndDate: this.targetEndDate,
    });
    this.isEditing = false;
  }
}
