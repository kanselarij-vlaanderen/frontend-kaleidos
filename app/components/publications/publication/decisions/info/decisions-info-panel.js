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
  @tracked decisionActivity;
  @tracked modelsForAgendaitemRoute;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  get sortedRegulationTypes() {
    return this.store.peekAll('regulation-type').slice().sort((c1, c2) => c1.position - c2.position);
  }

  get isValid() {
    return true;
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);
    this.decisionActivity = await this.args.publicationFlow.decisionActivity;
    if (this.isViaCouncilOfMinisters && this.decisionActivity) {
      // get the models meeting/agenda/agendaitem for clickable link
      this.modelsForAgendaitemRoute = await this.publicationService.getModelsForAgendaitemFromDecisionActivity(this.decisionActivity);
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
    this.decisionActivity.rollbackAttributes();
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
      saves.push(this.decisionActivity.save());
    }

    await Promise.all(saves);
  }
}
