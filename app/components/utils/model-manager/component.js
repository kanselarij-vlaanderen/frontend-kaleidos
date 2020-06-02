import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['vl-u-spacer'],
  modelName: null,

  title: cached('item.label'), // TODO in class syntax use as a decorator instead

  store: inject(),

  isAdding: false,
  isEditing: false,


  actions: {
    async editModel() {
      this.set('isLoading', true);
      const model = await this.get('item');
      model.set('label', this.get('title'));
      model.save().then(() => {
        this.set('title', null);
        this.set('isLoading', false);
        this.set('isEditing', false);
      });
    },

    createModel() {
      this.set('isLoading', true);
      const governmentDomain = this.store.createRecord(this.get('modelName'), {
        label: this.get('title')
      });
      governmentDomain.save().then(() => {
        this.set('title', null);
        this.set('isLoading', false);
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

  }
})
