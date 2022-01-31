import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;

  @tracked isEditing;

  @tracked decisionDate;

  constructor() {
    super(...arguments);

    this.regulationTypes =  this.store.peekAll('regulation-type').sortBy('position');
    this.initFields();
  }

  async initFields() {
    const publicationFlow = this.args.publicationFlow;
    this.publicationFlow = publicationFlow;

    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    this.decisionDate = agendaItemTreatment.startDate;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  setRegulationType(regulationType) {
    this.publicationFlow.regulationType = regulationType;
  }

  @action
  setDecisionDate(selectedDates) {
    this.decisionDate = selectedDates[0];
  }

  @task
  *closeEditingPanel() {
    yield this.initFields();
    yield this.performCancel();

    this.isEditing = false;
  }

  async performCancel() {
    const rollbacks = [];
    const regulationTypeReload = this.publicationFlow.belongsTo('regulationType').reload();
    rollbacks.push(regulationTypeReload);

    await Promise.all(rollbacks);
  }

  get isValid() {
    return true;
  }

  @task
  *save() {
    const publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isEditing = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    const saves = [];

    // Type regelgeving
    saves.push(this.publicationFlow.save());

    // Datum beslissing
    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    const oldDecisionDate = agendaItemTreatment.startDate;
    if (this.decisionDate !== oldDecisionDate) {
      agendaItemTreatment.startDate = this.decisionDate;
      const agendaItemTreatmentSave = agendaItemTreatment.save();
      saves.push(agendaItemTreatmentSave);
    }

    await Promise.all(saves);
  }
}
