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
  @tracked isEditingSubcaseName = false;
  @tracked selectedShortcut;
  @tracked subcaseName;
  @tracked subcaseType;
  @tracked agendaItemType;
  @tracked agendaItemTypes;
  @tracked decisionmakingFlow;
  @tracked decisionmakingFlowTitle;
  @tracked internalReview;

  @tracked isSaving = false;

  confidentialChanged = false;

  constructor() {
    super(...arguments);
    this.subcaseName = this.args.submission.subcaseName;
    this.isEditingSubcaseName = this.subcaseName?.length;
    this.loadDecisionmakingFlow.perform();
    this.loadSubcaseType.perform();
    this.loadAgendaItemType.perform();
    this.loadAgendaItemTypes.perform();
    this.loadInternalReview.perform();
  }

  @task
  *loadDecisionmakingFlow() {
    this.decisionmakingFlow = yield this.args.submission.belongsTo('decisionmakingFlow').reload();
    yield this.decisionmakingFlow?.case;
    this.decisionmakingFlowTitle = this.args.submission.decisionmakingFlowTitle;
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
  
  @task
  *loadInternalReview() {
    if (this.currentSession.may('treat-and-accept-submissions'))
    this.internalReview = yield this.args.submission.internalReview;
  }

  @action
  selectSubcaseName(shortcut) {
    this.selectedShortcut = shortcut;
    this.subcaseName = shortcut.label;
  }

  @action
  clearSubcaseName() {
    this.selectedShortcut = null;
    this.subcaseName = null;
  }

  @action
  async cancelEditing() {
    if (this.args.submission.hasDirtyAttributes) {
      this.args.submission.rollbackAttributes();
    }
    if (this.internalReview?.hasDirtyAttributes) {
      this.internalReview.rollbackAttributes();
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

    const trimmedDecisionmakingFlowTitle = trimText(this.decisionmakingFlowTitle);
    const trimmedShortTitle = trimText(this.args.submission.shortTitle);
    const trimmedTitle = trimText(this.args.submission.title);
    
    this.args.submission.decisionmakingFlowTitle = trimmedDecisionmakingFlowTitle;
    this.args.submission.shortTitle = trimmedShortTitle;
    this.args.submission.title = trimmedTitle;
    this.args.submission.subcaseName = this.subcaseName;
    this.args.submission.type = this.subcaseType;
    this.args.submission.agendaItemType = this.agendaItemType;
    await this.args.submission.save();

    if (this.internalReview?.hasDirtyAttributes) {
      await this.internalReview.save();
    }

    this.args.onSave();

    this.isSaving = false;
  }

  filterSubcaseTypes = (subcaseTypes) => {
    return subcaseTypes.filter(
      (type) => type.uri !== CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING
    );
  };
}
