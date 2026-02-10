import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { trimText, cleanPasteInputForTextarea } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument newsItem
 * @argument onSave
 * @argument onCancel
 */
export default class AgendaitemCasePanelEdit extends Component {
  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;
  @service currentSession;
  @service decisionReportGeneration;
  @service store;
  @service preventUnload;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked isEditingSubcaseName = false;
  @tracked selectedShortcut;
  @tracked subcaseType;
  @tracked subcaseName;
  @tracked internalReview;
  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  constructor() {
    super(...arguments);
    this.subcaseName = this.args.subcase?.subcaseName;
    this.isEditingSubcaseName = this.subcaseName?.length;
    this.loadInternalReview.perform();
    this.loadSubcaseType.perform();
    this.preventUnload.enable();
  }

  get newsItem() {
    return this.args.newsItem;
  }

  loadSubcaseType = task(async () => {
    this.subcaseType = await this.args.subcase?.type;
  })

  loadInternalReview = task(async () => {
    if (this.currentSession.may('manage-agendaitems')) {
      this.internalReview = await this.args.subcase?.internalReview;
    }
  });

  @action
  async onChangeConfidentiality(checked) {
    this.args.subcase.confidential = checked;
    this.confidentialChanged = true;
    const agendaitemType = await this.args.agendaitem.type;
    if (agendaitemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT && this.newsItem) {
      this.newsItem.inNewsletter = checked ? false : this.newsItem.inNewsletter;
    }
  }

  @action
  cancelEditing() {
    this.rollbackDirtyAttributes();
    this.preventUnload.disable();
    this.args.onCancel();
  }

  saveChanges = task(async () => {
    const shouldResetFormallyOk = this.args.agendaitem.hasDirtyAttributes;

    const trimmedTitle = trimText(this.args.agendaitem.title);
    const trimmedShortTitle = trimText(this.args.agendaitem.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
    };
    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      subcaseName: this.subcaseName,
      type: this.subcaseType,
      confidential: this.args.subcase?.confidential,
    };

    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.agendaitem,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      shouldResetFormallyOk,
    );
    if (this.confidentialChanged && this.args.subcase?.confidential) {
      await this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      await this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
      // update report contents
      const report = await this.store.queryOne('report', {
        'filter[:has-no:next-piece]': true,
        'filter[:has:piece-parts]': true,
        'filter[decision-activity][treatment][agendaitems][:id:]': this.args.agendaitem.id,
      });
      if (report) {
        await this.decisionReportGeneration.generateReplacementReport.perform(report);
      }
    }

    if (this.newsItem) {
      const agendaItemType = await this.args.agendaitem.type;
      const isAnnouncement = agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      if (isAnnouncement) {
        // Keep generated newsItem for announcement automatically in sync
        this.newsItem.htmlContent = trimmedTitle;
        this.newsItem.title = trimmedShortTitle;
        await this.newsItem.save();
      } else if (this.newsItem.hasDirtyAttributes) {
        await this.newsItem.save();
      }
    }
    if (this.internalReview?.hasDirtyAttributes) {
      await this.internalReview.hasMany('submissions').reload();
      await this.internalReview.save();
    }
    this.preventUnload.disable();
    this.args.onSave();
  });

  @action
  async selectSubcaseType(type) {
    this.subcaseType = type;
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

  pasteIntoShortTitle = (pasteEvent) => {
    this.args.agendaitem.shortTitle = cleanPasteInputForTextarea(pasteEvent, 'short-title-agendaitem', this.args.agendaitem.shortTitle);
  }

  pasteIntoTitle = (pasteEvent) => {
    this.args.agendaitem.title = cleanPasteInputForTextarea(pasteEvent, 'title-agendaitem', this.args.agendaitem.title);
  }

  rollbackDirtyAttributes = () => {
    if (this.args.agendaitem.hasDirtyAttributes) {
      this.args.agendaitem.rollbackAttributes();
    }
    // We change the value of confidental directly on subcase, so we should also roll it back
    if (this.args.subcase?.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    if (this.newsItem?.hasDirtyAttributes) {
      this.newsItem.rollbackAttributes();
    }
    if (this.internalReview?.hasDirtyAttributes) {
      this.internalReview.rollbackAttributes();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.rollbackDirtyAttributes();
  }
}
