import Component from '@ember/component';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
  classNames: ['vl-u-spacer'],
  modelName: null,

  label: getCachedProperty('label'),
  domain: getCachedProperty('domain'),
  iseCode: getCachedProperty('iseCode'),

  isAdding: false,
  isEditing: false,

  actions: {
    chooseIseCode(iseCode) {
      this.set('iseCode', iseCode);
    },

    async editModel() {
      this.set('isLoading', true);
      const model = await this.get('item');
      model.set('label', this.get('label'));
      model.set('domain', this.get('domain'));
      model.set('iseCode', this.get('iseCode'))
      model.save().then(() => {
        this.set('isLoading', false);
        this.set('domain', null);
        this.set('label', null);
        this.set('iseCode', null);
        this.set('isEditing', false);
      });
    },

    createModel() {
      this.set('isLoading', true);
      const governmentDomain = this.store.createRecord('government-field', {
        label: this.get('label'),
        domain: this.get('domain'),
        iseCode: this.get('iseCode')
      });
      governmentDomain.save().then(() => {
        this.set('isLoading', false);
        this.set('domain', null);
        this.set('label', null);
        this.set('iseCode', null);
        this.set('isAdding', false);
      });
    }
  }
})
