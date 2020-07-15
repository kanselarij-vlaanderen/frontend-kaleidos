import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, get, set } from '@ember/object';
import { saveChanges as saveSubcaseTitles, cancelEdit } from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation', 'showInNewsletter']);
  subcase = null;

  @action
  async cancelEditing() {
    cancelEdit(this.agendaitem, get(this, 'propertiesToSet'));
    this.toggleProperty('isEditing');
  }

  @action
  async saveChanges() {
    set(this, 'isLoading', true);
    let shouldResetFormallyOk = false;

    if (this.agendaitem.get('hasDirtyAttributes')) {
      shouldResetFormallyOk = true;
      // If only the showInNewsletter attribute has changed, the formally ok should not be reset
      if ((Object.keys(this.agendaitem.changedAttributes()).length == 1) && this.agendaitem.changedAttributes()['showInNewsletter']) {
        shouldResetFormallyOk = false;
      }
    }

    const propertiesToSetOnAgendaitem = {
      'title': trimText(this.agendaitem.title),
      'shortTitle': trimText(this.agendaitem.shortTitle),
      // explanation and showInNewsletter are set directly on the agendaitem, no need to have them in here
    };
    const propertiesToSetOnSubcase = {
      'title': trimText(this.agendaitem.title),
      'shortTitle': trimText(this.agendaitem.shortTitle),
    };
    propertiesToSetOnSubcase.confidential = await this.subcase.get('confidential');

    try {
      await saveSubcaseTitles(this.agendaitem, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, shouldResetFormallyOk);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    } catch (e) {
      set(this, 'isLoading', false);
      throw (e);
    }
  }

}
