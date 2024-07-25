import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default class SubmissionDescriptionPanelEditComponent extends Component {
  /**
   * @argument submission
   * @argument onCancel
   * @argument onSave
   */
  @service store;
  @service conceptStore;
  @service decisionReportGeneration;
  @service agendaitemAndSubcasePropertiesSync;
  @service pieceAccessLevelService;
  @service currentSession;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked selectedShortcut;
  @tracked subcaseType;
  @tracked agendaItemType;
  @tracked agendaItemTypes;
  @tracked decisionmakingFlow;
  @tracked decisionmakingFlowTitle;

  @tracked isSaving = false;

  confidentialChanged = false;

  constructor() {
    super(...arguments);
    this.loadDecisionmakingFlow.perform();
    this.loadSubcaseType.perform();
    this.loadAgendaItemType.perform();
    this.loadAgendaItemTypes.perform();
  }

  @task
  *loadDecisionmakingFlow() {
    this.decisionmakingFlow = yield this.args.submission.decisionmakingFlow;
    yield this.decisionmakingFlow?.case;
    this.decisionmakingFlowTitle = yield this.args.submission.title;
  }

  @task
  *loadSubcaseType() {
    this.subcaseType = yield this.args.submission.type;
  }

  @task
  *loadAgendaItemType() {
    this.agendaItemType = yield this.args.submission.agendaItemType;
  }

  @task
  *loadAgendaItemTypes() {
    this.agendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
  }

  @action
  async cancelEditing() {
    if (this.args.submission.hasDirtyAttributes) {
      this.args.submission.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @action
  async selectSubcaseType(type) {
    this.subcaseType = type;
  }

  @action
  onChangeAgendaItemType(selectedType) {
    this.agendaItemType = selectedType;
  }

  @action
  async saveChanges() {
    this.isSaving = true;
    this.args.submission.decisionmakingFlow = this.decisionmakingFlow;
    this.args.submission.title = this.decisionmakingFlowTitle;

    const trimmedShortTitle = trimText(this.args.submission.shortTitle);

    this.args.submission.shortTitle = trimmedShortTitle;
    this.args.submission.type = this.subcaseType;
    this.args.submission.agendaItemType = this.agendaItemType;
    await this.args.submission.save();

    this.args.onSave();

    this.isSaving = false;
  }

  filterSubcaseTypes = (subcaseTypes) => {
    return subcaseTypes.filter(
      (type) => type.uri !== CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING
    );
  };
}
