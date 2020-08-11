import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  action, get
} from '@ember/object';
import {
  saveChanges as saveSubcaseTitles, cancelEdit
} from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';
import { tracked } from '@glimmer/tracking';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  @tracked isLoading= false;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation', 'showInNewsletter']);


  @action
  async cancelEditing() {
    cancelEdit(this.args.agendaitem, get(this, 'propertiesToSet'));
    this.args.toggleIsEditing();
  }

  @action
  async saveChanges() {
    this.isLoading = true;
    let shouldResetFormallyOk = false;

    if (this.args.agendaitem.get('hasDirtyAttributes')) {
      shouldResetFormallyOk = true;
      // If only the showInNewsletter attribute has changed, the formally ok should not be reset
      if ((Object.keys(this.args.agendaitem.changedAttributes()).length === 1) && this.args.agendaitem.changedAttributes().showInNewsletter) {
        shouldResetFormallyOk = false;
      }
    }

    const propertiesToSetOnAgendaitem = {
      title: trimText(this.args.agendaitem.title),
      shortTitle: trimText(this.args.agendaitem.shortTitle),
      // explanation and showInNewsletter are set directly on the agendaitem, no need to have them in here
    };
    const propertiesToSetOnSubcase = {
      title: trimText(this.args.agendaitem.title),
      shortTitle: trimText(this.args.agendaitem.shortTitle),
    };
    propertiesToSetOnSubcase.confidential = await this.args.subcase.get('confidential');

    try {
      await saveSubcaseTitles(this.args.agendaitem, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, shouldResetFormallyOk);
      this.isLoading = false;
      this.args.toggleIsEditing();
    } catch (exception) {
      this.isLoading = false;
      throw (exception);
    }
  }
}
