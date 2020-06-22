import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, action, get, set } from '@ember/object';
import { saveChanges as saveSubcaseTitles, cancelEdit } from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from 'fe-redpencil/utils/trim-util';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'accessLevel', 'confidential', 'showInNewsletter']);

  @computed('item.modelName')
  get isAgendaItem() {
    return 'agendaitem' == get(this, 'item.modelName');
  }

  @alias('item.showAsRemark') isRemark;
  @alias('item.title') title;
  @alias('item.shortTitle') shortTitle;
  @alias('item.accessLevel') accessLevel;
  @alias('item.confidential') confidential;

  @action
  async cancelEditing() {
    const item = await get(this, 'item');
    cancelEdit(item, get(this, 'propertiesToSet'));
    this.toggleProperty('isEditing');
  }

  @action
  setAccessLevel(accessLevel) {
    set(this, 'accessLevel', accessLevel);
  }

  @action
  async saveChanges() {
    set(this, 'isLoading', true);

    const propertiesToSetOnAgendaitem = {
      'title': trimText(get(this, 'title')),
      'shortTitle': trimText(get(this, 'shortTitle')),
    };
    const propertiesToSetOnSubcase = {
      'title': trimText(get(this, 'title')),
      'shortTitle': trimText(get(this, 'shortTitle')),
    };

    if (await get(this, 'showInNewsletter') != null || await get(this, 'showInNewsletter') != undefined) {
      //This means the value has changed, get the local one
      propertiesToSetOnAgendaitem['showInNewsletter'] = await get(this, 'showInNewsletter');
    }

    // TODO These await ARE necessary, Ember doesn't think so
    if (!this.isAgendaItem) {
      propertiesToSetOnSubcase['accessLevel'] = await get(this, 'accessLevel');
      propertiesToSetOnSubcase['confidential'] = await get(this, 'confidential');
    }

    try {
      await saveSubcaseTitles(get(this, 'item'), propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    } catch (e) {
      set(this, 'isLoading', false);
      throw (e);
    }
  }

  @action
  async toggleShowInNewsletter(item) {
    const value = await get(item, 'showInNewsletter');
    set(this, 'showInNewsletter', !value);
  }
}
