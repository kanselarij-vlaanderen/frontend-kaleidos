import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  action, get
} from '@ember/object';
import {
  saveChanges as saveSubcaseTitles, cancelEdit
} from 'fe-redpencil/utils/agendaitem-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemTitlesEdit extends Component {
  @service store;
  @tracked isLoading = false;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation']);

  get newsletterInfo() {
    return this.args.newsletterInfo;
  }

  @action
  async cancelEditing() {
    cancelEdit(this.args.agendaitem, get(this, 'propertiesToSet'));
    if (this.newsletterInfo && this.newsletterInfo.get('hasDirtyAttributes')) {
      this.newsletterInfo.rollbackAttributes();
    }
    this.args.toggleIsEditing();
  }

  @action
  async saveChanges() {
    this.isLoading = true;
    const shouldResetFormallyOk = this.args.agendaitem.get('hasDirtyAttributes');

    const propertiesToSetOnAgendaitem = {
      title: trimText(this.args.agendaitem.title),
      shortTitle: trimText(this.args.agendaitem.shortTitle),
      // explanation and showInNewsletter are set directly on the agendaitem, no need to have them in here
    };
    const propertiesToSetOnSubcase = {
      title: trimText(this.args.agendaitem.title),
      shortTitle: trimText(this.args.agendaitem.shortTitle),
    };

    if (this.args.subcase) {
      propertiesToSetOnSubcase.confidential = await this.args.subcase.get('confidential');
    }

    try {
      await saveSubcaseTitles(this.args.agendaitem, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, shouldResetFormallyOk);
      if (this.newsletterInfo && this.newsletterInfo.get('hasDirtyAttributes')) {
        await this.newsletterInfo.save();
      }
      if (this.newsletterInfo && this.args.agendaitem.showAsRemark) {
        this.newsletterInfo.set('richtext', trimText(this.args.agendaitem.title));
        this.newsletterInfo.set('title', trimText(this.args.agendaitem.shortTitle));
      }
      this.isLoading = false;
      this.args.toggleIsEditing();
    } catch (exception) {
      this.isLoading = false;
      throw (exception);
    }
  }
}
