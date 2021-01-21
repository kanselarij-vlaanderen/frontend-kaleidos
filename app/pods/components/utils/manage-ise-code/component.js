import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['auk-u-mb-4'],
  modelName: null,

  name: cached('item.name'), // TODO in class syntax use as a decorator instead
  code: cached('item.code'), // TODO in class syntax use as a decorator instead
  field: cached('item.field'), // TODO in class syntax use as a decorator instead

  store: inject(),

  isAdding: false,
  isEditing: false,

  actions: {
    async editModel() {
      this.set('isLoading', true);
      const model = await this.get('item');
      const field = await this.get('field');
      model.set('name', this.get('name'));
      model.set('code', this.get('code'));
      model.set('field', field);
      model.save().then(() => {
        this.set('isLoading', false);
        this.set('field', null);
        this.set('isEditing', false);
      });
      this.send('selectModel', null);
    },

    async createModel() {
      this.set('isLoading', true);
      const field = await this.get('field');
      const governmentDomain = this.store.createRecord('ise-code', {
        name: this.get('name'),
        code: this.get('code'),
        field,
      });
      governmentDomain.save().then(() => {
        this.set('isLoading', false);
        this.set('code', null);
        this.set('name', null);
        this.set('field', null);
        this.set('isAdding', false);
      });
    },
    close() {
      this.close();
    },

    selectModel(model) {
      this.set('item', model);
    },

    toggleIsAdding() {
      this.toggleProperty('isAdding');
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    chooseField(field) {
      this.set('field', field);
    },

    removeModel() {
      alert('This action is not allowed. Please contact the system administrator.');
    },
  },
});
