import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SubCasesOverviewHeader extends Component {
  // Services
  @service currentSession;
  @service router;

  // Tracked.
  @tracked showAddSubcaseModal = false;
  @tracked showEditCaseModal = false;

  @tracked title = null;
  @tracked shortTitle = null;


  get caseTitleFromCase() {
    const shortTitle = this.args.case.shortTitle;
    if (shortTitle) {
      return shortTitle;
    }
    return this.args.case.title;
  }

  @action
  goBackToCases() {
    this.router.transitionTo('cases');
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
  async saveEditCase(caseData) {
    const caze = this.args.case;
    caze.shortTitle = caseData.shortTitle;
    caze.confidential = caseData.confidential;
    await this.args.onSaveCase(caze);
    this.closeEditCaseModal();
  }

  @action
  async saveAddSubcase(subCaseData) {
    await this.args.onSaveSubcase(subCaseData.subcase);
    this.closeAddSubcaseModal();
  }
}
