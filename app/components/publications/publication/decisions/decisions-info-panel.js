import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;
  @service publicationService;

  @tracked isInEditMode;

  @tracked decisionDate;

  constructor() {
    super(...arguments);
  }

  async initFields() {
    let publicationFlow = this.args.publicationFlow;
    let agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    this.decisionDate = agendaItemTreatment.startDate;
  }

  @action
  putInEditMode() {
    this.isInEditMode = true;
  }

  @action
  setDecisionDate(selectedDates) {
    this.decisionDate = selectedDates[0];
  }

  @action
  async cancelEdit() {
    this.isInEditMode = false;
  }

  get isValid() {
    return true;
  }

  @task
  *save() {
    let publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave() {

  }
}
