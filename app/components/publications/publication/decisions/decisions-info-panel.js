import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;
  @service publicationService;

  @tracked isInEditMode;

  @tracked isViaCouncilOfMinisters;

  @tracked regulationType;
  @tracked decisionDate;

  constructor() {
    super(...arguments);

    this.regulationTypes =  this.store.peekAll('regulation-type').sortBy('position');
    this.initFields();
  }

  async initFields() {
    const publicationFlow = this.args.publicationFlow;

    this.isViaCouncilOfMinisters = await this.publicationService.getIsViaCouncilOfMinisters(publicationFlow);

    this.regulationType = await publicationFlow.regulationType;

    const agendaItemTreatment = await publicationFlow.agendaItemTreatment;
    this.decisionDate = agendaItemTreatment.startDate;
  }

  @action
  putInEditMode() {
    this.isInEditMode = true;
  }

  @action
  setRegulationType(regulationType) {
    this.regulationType = regulationType;
  }

  @action
  setDecisionDate(selectedDates) {
    this.decisionDate = selectedDates[0];
  }

  @action
  async cancelEdit() {
    await this.initFields();
    this.isInEditMode = false;
  }

  get isValid() {
    return true;
  }

  @task
  *save() {
    const publicationFlow = this.args.publicationFlow;
    yield this.performSave(publicationFlow);
    this.isInEditMode = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave(publicationFlow) {
    const saves = [];

    // Type regelgeving
    const oldRegulationType = await publicationFlow.regulationType;
    if (oldRegulationType !== this.regulationType) {
      publicationFlow.regulationType = this.regulationType;
      saves.push(publicationFlow.save());
    }

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
