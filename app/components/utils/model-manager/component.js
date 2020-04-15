import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
  classNames: ['vl-u-spacer'],
  modelName: null,

  title: cached('item.label'), // TODO in class syntax use as a decorator instead

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
    }
  }
})
