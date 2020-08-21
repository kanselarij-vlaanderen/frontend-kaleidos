import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, get, set
} from '@ember/object';
import {
  saveChanges as saveSubcaseTitles, cancelEdit
} from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';

export default class AgendaitemTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation']);
  subcase = null;
  newsletterInfo = null;

  @action
  async cancelEditing() {
    cancelEdit(this.agendaitem, get(this, 'propertiesToSet'));
    if (this.newsletterInfo && this.newsletterInfo.get('hasDirtyAttributes')) {
      this.newsletterInfo.rollbackAttributes();
    }
    this.toggleProperty('isEditing');
  }

  @action
  async saveChanges() {
    set(this, 'isLoading', true);

    const shouldResetFormallyOk = this.agendaitem.get('hasDirtyAttributes');

    const propertiesToSetOnAgendaitem = {
      title: trimText(this.agendaitem.title),
      shortTitle: trimText(this.agendaitem.shortTitle),
      // explanation and showInNewsletter are set directly on the agendaitem, no need to have them in here
    };

    const propertiesToSetOnSubcase = {
      title: trimText(this.agendaitem.title),
      shortTitle: trimText(this.agendaitem.shortTitle),
    };

    if (this.subcase) {
      propertiesToSetOnSubcase.confidential = await this.subcase.get('confidential');
    }

    try {
      await saveSubcaseTitles(this.agendaitem, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, shouldResetFormallyOk);
      if (this.newsletterInfo && this.newsletterInfo.get('hasDirtyAttributes')) {
        await this.newsletterInfo.save();
      }
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    } catch (exception) {
      set(this, 'isLoading', false);
      throw (exception);
    }
  }
}
