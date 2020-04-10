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

  isRemark = alias('item.showAsRemark');

  @computed('item.modelName')
  get isAgendaItem() {
    return 'agendaitem' == this.get('item.modelName');
  }

  @cached('title') title;
  @cached('accessLevel') accessLevel;
  @cached('shortTitle') shortTitle;
  @cached('confidential') confidential;
  @cached('showInNewsletter') showInNewsletter;

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
    await saveSubcaseTitles(get(this, 'item'), get(this, 'propertiesToSet'), get(this, 'propertiesToSet'), true);
    set(this, 'isLoading', false);
    this.toggleProperty('isEditing');
  }
}
