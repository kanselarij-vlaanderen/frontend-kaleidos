import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';

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
  @service toaster;

  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  get newsItem() {
    return this.args.newsItem;
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
    this.args.onSave();
  }

  @action
  async setAndSaveFormallyOkStatus(newFormallyOkUri) {
    this.args.agendaitem.formallyOk = newFormallyOkUri;
    const status = CONFIG.formallyOkOptions.find((type) => type.uri === newFormallyOkUri);
    try {
      await this.args.agendaitem.save();
      this.toaster.success(this.intl.t('successfully-modified-formally-ok-status', {
        status: status.label,
      }));
    } catch {
      this.args.agendaitem.rollbackAttributes();
    }
  }
}
