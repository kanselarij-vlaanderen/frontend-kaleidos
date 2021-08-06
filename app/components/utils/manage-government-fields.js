// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { cached } from 'frontend-kaleidos/decorators/cached';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mb-4'],
  modelName: null,

  label: cached('item.label'), // TODO in class syntax use as a decorator instead
  domain: cached('item.domain'), // TODO in class syntax use as a decorator instead
  iseCode: cached('item.iseCode'), // TODO in class syntax use as a decorator instead

  isAdding: false,
  isEditing: false,
  store: inject(),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    chooseIseCode(iseCode) {
      this.set('iseCode', iseCode);
    },

    async editModel() {
      this.set('isLoading', true);
      const model = await this.get('item');
      model.set('label', this.get('label'));
      model.set('domain', this.get('domain'));
      model.set('iseCode', this.get('iseCode'));
      model.save().then(() => {
        this.set('isLoading', false);
        this.set('domain', null);
        this.set('iseCode', null);
        this.set('isEditing', false);
      });
      this.send('selectModel', null);
    },

    createModel() {
      this.set('isLoading', true);
      const governmentDomain = this.store.createRecord('government-field', {
        label: this.get('label'),
        domain: this.get('domain'),
        iseCode: this.get('iseCode'),
      });
      governmentDomain.save().then(() => {
        this.set('isLoading', false);
        this.set('domain', null);
        this.set('label', null);
        this.set('iseCode', null);
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

    chooseDomain(domain) {
      this.set('domain', domain);
    },

    removeModel() {
      alert('This action is not allowed. Please contact the system administrator.');
    },
  },
});
