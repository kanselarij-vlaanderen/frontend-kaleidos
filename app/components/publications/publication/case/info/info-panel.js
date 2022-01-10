import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service publicationService;

  @tracked isInEditMode;

  @tracked isUrgent;
  @tracked localIdentifier;
  @tracked versionIdentifier;
  @tracked numacNumbers;
  @tracked decisionDate;
  @tracked openingDate;
  @tracked publicationDueDate;

  constructor() {
    super(...arguments);
  }

  @action
  async putInEditMode() {
    var publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;
    this.isUrgent = await this.publicationService.getIsUrgent(publicationFlow);
  }

  @action
  onChangeIsUrgent(ev) {
    var isUrgent = ev.target.checked;
    this.isUrgent = isUrgent;
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  @task
  *save() {
    var publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to avoid ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    publicationFlow.urgencyLevel =
      await this.publicationService.getUrgencyLevel(this.isUrgent);
    await publicationFlow.save();
  }
}
