import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SubCasesOverviewHeader extends Component {
  @service currentSession;
  @service transitionHistory;

  @tracked case;
  @tracked showAddSubcaseModal = false;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.case = yield this.args.decisionmakingFlow.case;
    this.publicationFlows = yield this.case.publicationFlows;
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
    await this.args.onCreateSubcase();
    this.closeAddSubcaseModal();
  }

  @action
  transitionBack() {
    this.transitionHistory.goBack('/dossiers');
  }
}
