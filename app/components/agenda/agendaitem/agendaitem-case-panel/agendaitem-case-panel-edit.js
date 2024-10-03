import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
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

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked isEditingSubcaseName = false;
  @tracked selectedShortcut;
  @tracked subcaseName;
  @tracked internalReview;
  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  constructor() {
    super(...arguments);
    this.subcaseName = this.args.subcase?.subcaseName;
    this.isEditingSubcaseName = this.subcaseName?.length;
    this.loadInternalReview.perform();
  }

  get newsItem() {
    return this.args.newsItem;
  }
  
  @task
  *loadInternalReview() {
    if (this.currentSession.may('manage-agendaitems')) {
      this.internalReview = yield this.args.subcase?.internalReview;
    }
  }

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
    if (this.args.agendaitem.hasDirtyAttributes) {
      this.args.agendaitem.rollbackAttributes();
    }
    // We change the value of confidental directly on subcase, so we should also roll it back
    if (this.args.subcase?.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    if (this.newsItem && this.newsItem.hasDirtyAttributes) {
      this.newsItem.rollbackAttributes();
    }
    if (this.internalReview?.hasDirtyAttributes) {
      this.internalReview.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @task
  *saveChanges() {
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
      confidential: this.args.subcase?.confidential,
    };

    yield this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.agendaitem,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      shouldResetFormallyOk,
    );
    if (this.confidentialChanged && (this.args.subcase && this.args.subcase.confidential)) {
      yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      yield this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
    }

    if (this.newsItem) {
      const agendaItemType = yield this.args.agendaitem.type;
      const isAnnouncement = agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      if (isAnnouncement) {
        // Keep generated newsItem for announcement automatically in sync
        this.newsItem.htmlContent = trimmedTitle;
        this.newsItem.title = trimmedShortTitle;
        yield this.newsItem.save();
      } else if (this.newsItem.hasDirtyAttributes) {
        yield this.newsItem.save();
      }
    }
    if (this.internalReview?.hasDirtyAttributes) {
      yield this.internalReview.save();
    }
    this.args.onSave();
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
}
