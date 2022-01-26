import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class SubCasesOverviewHeader extends Component {
  @service currentSession;

  @tracked showAddSubcaseModal = false;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;

  constructor() {
    super(...arguments);
    this.loadPublicationFlows.perform();
  }

  @task
  *loadPublicationFlows() {
    this.publicationFlows = yield this.args.case.publicationFlows;
  }

  @action
  openAddSubcaseModal() {
    this.showAddSubcaseModal = true;
  }

  @action
  closeAddSubcaseModal() {
    this.showAddSubcaseModal = false;
  }

  @action
  openEditCaseModal() {
    this.showEditCaseModal = true;
  }

  @action
  closeEditCaseModal() {
    this.showEditCaseModal = false;
  }

  @action
  async saveCase(caseData) {
    await this.args.onSaveCase(caseData);
    this.closeEditCaseModal();
  }

  @action
  async onCreateSubcase() {
    this.args.onCreateSubcase();
    this.closeAddSubcaseModal();
  }
}
