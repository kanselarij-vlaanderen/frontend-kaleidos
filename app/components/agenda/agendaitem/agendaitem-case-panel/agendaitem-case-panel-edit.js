import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
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

  @tracked agendaItemType;

  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  constructor() {
    super(...arguments);
    this.loadAgendaItemType.perform();
  }

  get newsletterInfo() {
    return this.args.newsletterInfo;
  }

  get isRemark() {
    return this.agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.REMARK;
  }

  @action
  async cancelEditing() {
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
  *loadAgendaItemType() {
    this.agendaItemType = yield this.args.agendaitem.type;
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
    if (
      this.newsletterInfo &&
      (this.newsletterInfo.hasDirtyAttributes || this.isRemark)
    ) {
      if (this.isRemark) {
        // Keep generated newsletterInfo for announcement in sync
        this.newsletterInfo.richtext = trimmedTitle;
        this.newsletterInfo.title = trimmedShortTitle;
      }
      yield this.newsletterInfo.save();
    }
    this.args.onSave();
  }
}
