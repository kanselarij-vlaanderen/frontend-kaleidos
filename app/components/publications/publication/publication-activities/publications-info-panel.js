import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {publicationSubcase}
 * @argument {PublicationFlow}
 * @argument {isFinal} if publication status is in final state
 */
export default class PublicationsPublicationPublicationActivitiesPublicationInfoPanel extends Component {
  @service store;

  @tracked isEditing = false;
  @tracked publicationStatus;
  @tracked publicationModes;

  @tracked publicationMode;
  @tracked targetEndDate;


  constructor() {
    super(...arguments);
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
    this.initFields();
  }

  initFields() {
    this.targetEndDate = this.args.publicationSubcase.targetEndDate;
    this.publicationMode = this.args.publicationFlow.mode;
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
  setTargetEndDate(selectedDates) {
    this.targetEndDate = selectedDates[0];
  }

  @action
  setPublicationMode(publicationMode) {
    this.publicationMode = publicationMode;
  }

  @task
  *save() {
    yield this.performSave();
    this.isEditing = false;
  }

  async performSave() {
    const publicationSubcase = this.args.publicationSubcase;
    publicationSubcase.targetEndDate = this.targetEndDate;
    await publicationSubcase.save();

    const publicationFlow = this.args.publicationFlow;
    publicationFlow.mode = this.publicationMode;
    await publicationFlow.save();
  }
}
