import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationCaseInfoPanelComponent extends Component {
  @service store;
  @service publicationService;

  @tracked isEditing;
  @tracked isViaCouncilOfMinisters;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);
    this.agendaItemTreatment = await this.args.publicationFlow.agendaItemTreatment;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  setDecisionDate(selectedDates) {
    this.agendaItemTreatment.startDate = selectedDates[0];
  }

  get sortedRegulationTypes() {
    return this.store.peekAll('regulation-type').sortBy('position');
  }

  get isValid() {
    return true;
  }

  @task
  *closeEditingPanel() {
    yield this.performCancel();
    this.isEditing = false;
  }

  async performCancel() {
    await Promise.all([
      this.args.publicationFlow.belongsTo('regulationType').reload()
    ]);

    this.agendaItemTreatment.rollbackAttributes();
  }

  @task
  *save() {
    yield this.performSave();
    this.isEditing = false;
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performSave() {
    const saves = [];

    // Type regelgeving
    saves.push(this.args.publicationFlow.save());

    // Datum beslissing
    saves.push(this.agendaItemTreatment.save());

    await Promise.all(saves);
  }
}
