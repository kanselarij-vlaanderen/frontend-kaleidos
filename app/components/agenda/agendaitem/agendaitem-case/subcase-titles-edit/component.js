import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, action, get, set } from '@ember/object';
import { cached } from 'fe-redpencil/decorators/cached';
import { saveChanges as saveSubcaseTitles, cancelEdit } from 'fe-redpencil/utils/agenda-item-utils';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['vl-form__group', 'vl-u-bg-porcelain'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'accessLevel', 'confidential', 'showInNewsletter']);

  @alias('item.showAsRemark') isRemark;

  @computed('item.modelName')
  get isAgendaItem() {
    return 'agendaitem' == this.get('item.modelName');
  }

  @cached('item.title') title;
  @cached('item.accessLevel') accessLevel;
  @cached('item.shortTitle') shortTitle;
  @cached('item.confidential') confidential;
  @cached('item.showInNewsletter') showInNewsletter;

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
      'title': this.get('title'),
      'shortTitle': this.get('shortTitle'),
      'accessLevel': this.get('accessLevel'),
      'confidential': this.get('confidential'),
      'showInNewsletter': this.get('showInNewsletter')
    };
    const propertiesToSetOnSubcase = {
      'title': this.get('title'),
      'shortTitle': this.get('shortTitle'),
      'accessLevel': this.get('accessLevel'),
      'confidential': this.get('confidential'),
      'showInNewsletter': this.get('showInNewsletter')
    };

    await saveSubcaseTitles(get(this, 'item'), propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
    set(this, 'isLoading', false);
    this.toggleProperty('isEditing');
  }
}
