import Component from '@ember/component';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
  classNames: ['vl-u-spacer'],
  modelName: null,

  name: getCachedProperty('name'),
  code: getCachedProperty('code'),
  field: getCachedProperty('field'),

  actions: {
    async editModel() {
      this.set('isLoading', true);
      const model = await this.get('item');
      const field = await this.get('field');
      model.set('name', this.get('name'));
      model.set('code', this.get('code'));
      model.set('field', field)
      model.save().then(() => {
        this.set('isLoading', false);
        this.set('code', null);
        this.set('name', null);
        this.set('field', null);
        this.set('isEditing', false);
      });
    },

    async createModel() {
      this.set('isLoading', true);
      const field = await this.get('field');
      const governmentDomain = this.store.createRecord('ise-code', {
        name: this.get('name'),
        code: this.get('code'),
        field: field
      });
      governmentDomain.save().then(() => {
        this.set('isLoading', false);
        this.set('code', null);
        this.set('name', null);
        this.set('field', null);
        this.set('isAdding', false);
      });
    }
  }
})
