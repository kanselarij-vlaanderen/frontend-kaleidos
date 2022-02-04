import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  saveChanges as saveSubcaseTitles,
  cancelEdit,
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemTitlesEdit extends Component {
  @service store;
  @service subcasesService;
  @tracked isSaving = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation']);
  initialSubcaseConfidentiality = this.args.subcase?.confidential;

  get newsletterInfo() {
    return this.args.newsletterInfo;
  }

  @action
  async cancelEditing() {
    cancelEdit(this.args.agendaitem, this.propertiesToSet);
    // We change the value of confidental directly on subcase, so we should also roll it back
    if (this.args.subcase) {
      cancelEdit(this.args.subcase, ['confidential']);
    }
    if (this.newsletterInfo && this.newsletterInfo.hasDirtyAttributes) {
      this.newsletterInfo.rollbackAttributes();
    }
    this.args.toggleIsEditing();
  }

  @action
  async saveChanges() {
    this.isSaving = true;
    const shouldResetFormallyOk =
      this.args.agendaitem.hasDirtyAttributes;

    const trimmedTitle = trimText(this.args.agendaitem.title);
    const trimmedShortTitle = trimText(this.args.agendaitem.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      // explanation is set directly on the agendaitem, no need to have it in here
    };
    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      confidential: this.args.subcase?.confidential,
    };

    try {
      await saveSubcaseTitles(
        this.args.agendaitem,
        propertiesToSetOnAgendaitem,
        propertiesToSetOnSubcase,
        shouldResetFormallyOk
      );
      if (
        this.newsletterInfo &&
        (this.newsletterInfo.hasDirtyAttributes ||
          this.args.agendaitem.showAsRemark)
      ) {
        if (this.args.agendaitem.showAsRemark) {
          // Keep generated newsletterInfo for announcement in sync
          this.newsletterInfo.richtext = trimmedTitle;
          this.newsletterInfo.title = trimmedShortTitle;
        }
        await this.newsletterInfo.save();
      }
      if (
        this.initialSubcaseConfidentiality === false &&
        this.args.subcase?.confidential === true
      ) {
        // When the confidentiality was changed from false to true, we have to make all pieces confidential
        await this.subcasesService.cascadeConfidentialityToPieces(
          this.args.subcase
        );
      }

      this.args.toggleIsEditing();
    } finally {
      this.isSaving = false;
    }
  }
}
