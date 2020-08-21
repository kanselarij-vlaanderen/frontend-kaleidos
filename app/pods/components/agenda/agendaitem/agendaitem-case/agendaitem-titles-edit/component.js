import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, get, set
} from '@ember/object';
import {
  saveChanges as saveSubcaseTitles, cancelEdit
} from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';
import { task } from 'ember-concurrency';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'explanation']);
  subcase = null;
  newsletterInfo = false; // Only used for announcements

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    if (this.agendaitem && this.agendaitem.showAsRemark) {
      this.loadNewsletterInfo.perform();
    }
  }

  @(task(function *() {
    const results = yield this.store.query('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': this.agendaitem.id,
    });
    if (results.length) {
      this.newsletterInfo = results.firstObject;
    }
  })) loadNewsletterInfo;

  @action
  async cancelEditing() {
    cancelEdit(this.agendaitem, get(this, 'propertiesToSet'));
    if (this.newsletterInfo && this.newsletterInfo.hasDirtyAttributes) {
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
      if (this.newsletterInfo && this.newsletterInfo.hasDirtyAttributes) {
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
