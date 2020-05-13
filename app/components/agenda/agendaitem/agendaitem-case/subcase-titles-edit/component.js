import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, action, get, set } from '@ember/object';
import { saveChanges as saveSubcaseTitles, cancelEdit } from 'fe-redpencil/utils/agenda-item-utils';
import { trimText } from '../../../../../utils/trim-util';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'accessLevel', 'confidential', 'showInNewsletter']);

  @computed('item.modelName')
  get isAgendaItem() {
    return 'agendaitem' == this.get('item.modelName');
  }

  @alias('item.showAsRemark') isRemark;
  @alias('item.title') title;
  @alias('item.shortTitle') shortTitle;
  @alias('item.accessLevel') accessLevel;
  @alias('item.confidential') confidential;

  @action
  async cancelEditing() {
    const item = await this.get('item');
    cancelEdit(item, get(this, 'propertiesToSet'));
    this.toggleProperty('isEditing');
  }

  @action
  setAccessLevel(accessLevel) {
    this.set('accessLevel', accessLevel);
  }

  @action
  async saveChanges() {
    set(this, 'isLoading', true);

    const propertiesToSetOnAgendaitem = {
      'title': trimText(this.get('title')),
      'shortTitle': trimText(this.get('shortTitle')),
    };
    const propertiesToSetOnSubcase = {
      'title': trimText(this.get('title')),
      'shortTitle': trimText(this.get('shortTitle')),
    };

    if (await this.get('showInNewsletter') != null || await this.get('showInNewsletter') != undefined) {
      //This means the value has changed, get the local one
      propertiesToSetOnAgendaitem['showInNewsletter'] = await this.get('showInNewsletter');
    }

    // TODO These await ARE necessary, Ember doesn't think so
    if (!this.isAgendaItem) {
      propertiesToSetOnSubcase['accessLevel'] = await this.get('accessLevel');
      propertiesToSetOnSubcase['confidential'] = await this.get('confidential');
    }

    await saveSubcaseTitles(get(this, 'item'), propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
    set(this, 'isLoading', false);
    this.toggleProperty('isEditing');
  }

  @action
  async toggleShowInNewsletter(item) {
    const value = await item.get('showInNewsletter');
    this.set('showInNewsletter', !value);
  }
}

