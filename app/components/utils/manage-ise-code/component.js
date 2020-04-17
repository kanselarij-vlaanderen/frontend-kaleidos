import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
  classNames: ['vl-u-spacer'],
  modelName: null,

  name: cached('item.name'), // TODO in class syntax use as a decorator instead
  code: cached('item.code'), // TODO in class syntax use as a decorator instead
  field: cached('item.field'), // TODO in class syntax use as a decorator instead

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
