import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument newsletterInfo
 * @argument onSave
 * @argument onCancel
 */
export default class AgendaitemCasePanelEdit extends Component {
  @service store;
  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;

  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  get newsletterInfo() {
    return this.args.newsletterInfo;
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
    if (this.newsletterInfo && this.newsletterInfo.hasDirtyAttributes) {
      this.newsletterInfo.rollbackAttributes();
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
    if (this.args.subcase && this.args.subcase.confidential) {
      yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
    }

    if (this.newsletterInfo) {
      const agendaItemType = yield this.args.agendaitem.type;
      const isAnnouncement = agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      if (isAnnouncement) {
        // Keep generated newsletterInfo for announcement automatically in sync
        this.newsletterInfo.richtext = trimmedTitle;
        this.newsletterInfo.title = trimmedShortTitle;
        yield this.newsletterInfo.save();
      } else if (this.newsletterInfo.hasDirtyAttributes) {
        yield this.newsletterInfo.save();
      }
    }
    this.args.onSave();
  }
}
