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
  @tracked agendaItemTreatment;
  @tracked modelsForAgendaitemRoute;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  get sortedRegulationTypes() {
    return this.store.peekAll('regulation-type').sortBy('position');
  }

  get isValid() {
    return true;
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);
    this.agendaItemTreatment = await this.args.publicationFlow.agendaItemTreatment;
    if (this.isViaCouncilOfMinisters) {
      // get the models meeting/agenda/agendaitem for clickable link
      this.modelsForAgendaitemRoute = await this.publicationService.getModelsForAgendaitemFromTreatment(this.agendaItemTreatment);
    }
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
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

    this.args.publicationFlow.rollbackAttributes();
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
    if (!this.isViaCouncilOfMinisters) {
      saves.push(this.agendaItemTreatment.save());
    }

    await Promise.all(saves);
  }
}
