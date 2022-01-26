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

  @tracked publicationModes;

  constructor() {
    super(...arguments);
    this.publicationModes = this.store.peekAll('publication-mode').sortBy('position');
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  async closeEditingPanel() {
    this.isEditing = false;
    await this.args.publicationSubcase.rollbackAttributes();
    await this.args.publicationFlow.belongsTo('mode')
      .reload();
  }

  @action
  setTargetEndDate(selectedDates) {
    this.args.publicationSubcase.targetEndDate = selectedDates[0];
  }

  @action
  setPublicationMode(publicationMode) {
    this.args.publicationFlow.mode = publicationMode;
  }

  @task
  *save() {
    const publicationSubcase = this.args.publicationSubcase;
    yield publicationSubcase.save();

    const publicationFlow = this.args.publicationFlow;
    yield publicationFlow.save();
    this.isEditing = false;
  }
}
