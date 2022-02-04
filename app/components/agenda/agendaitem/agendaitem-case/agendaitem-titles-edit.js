import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  saveChanges as saveSubcaseTitles,
  cancelEdit,
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency-decorators';

export default class AgendaitemTitlesEdit extends Component {
  @service store;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation']);

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

  @task
  *saveChanges() {
    const shouldResetFormallyOk = this.args.agendaitem.hasDirtyAttributes;

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

    yield saveSubcaseTitles(
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
      yield this.newsletterInfo.save();
    }

    this.args.toggleIsEditing();
  }
}
