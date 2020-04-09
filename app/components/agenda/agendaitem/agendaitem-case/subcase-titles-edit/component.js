import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { saveChanges } from 'fe-redpencil/utils/agenda-item-utils';

export default Component.extend({
  store: inject(),
  classNames: ['vl-form__group', 'vl-u-bg-porcelain'],
  propertiesToSet: Object.freeze(['title', 'shortTitle', 'accessLevel', 'confidential', 'showInNewsletter']),

  isRemark: alias('item.showAsRemark'),

  isAgendaItem: computed('item.modelName', function () {
    return 'agendaitem' == this.get('item.modelName');
  }),

  title: getCachedProperty('title'),
  accessLevel: getCachedProperty('accessLevel'),
  shortTitle: getCachedProperty('shortTitle'),
  confidential: getCachedProperty('confidential'),
  showInNewsletter: getCachedProperty('showInNewsletter'),

  actions: {
    async cancelEditing() {
      const item = await this.get('item');
      if (item.get('hasDirtyAttributes')) {
        item.rollbackAttributes();
      }
      if (this.isSubcase) {
        item.belongsTo('type').reload();
        item.belongsTo('accessLevel').reload();
      }
      item.reload();
      this.propertiesToSet.forEach(prop => item.notifyPropertyChange(prop));
      this.toggleProperty('isEditing');
    },

    setAccessLevel(accessLevel) {
      this.set('accessLevel', accessLevel);
    },

    async saveChanges() {
      set(this, 'isLoading', true);
      await saveChanges(get(this, 'item'), get(this, 'propertiesToSet'), get(this, 'propertiesToSet'), true);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    }
  }
});
