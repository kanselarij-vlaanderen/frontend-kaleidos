import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';

export default Component.extend(isAuthenticatedMixin, {
  globalError: service(),
  classNames: ['vl-u-spacer--large'],
  
  model: alias('uploadedFiles'),
  
  isLoading: false,
  
  init() {
    this._super(...arguments);
    this.set('model', A([]));
  },
  
  actions: {
    delete(file) {
      file.destroyRecord().then(() => {
        this.get('model').removeObject(file);
      })
    },
    
    add(file) {
      this.get('model').pushObject(file);
    },
    
    save() {
      if (this.save) {
        this.set('isLoading', true);
        this.save(this.get('model'))
          .finally(() => this.set('isLoading', false));
      } 
    },
    
    close() {
      this.get('model').invoke('destroyRecord');
      if (this.onClose) {
        this.onClose(...arguments);
      } 
    },
    
    cancel() {
      this.get('model').invoke('destroyRecord');
      if (this.onCancel) {
        this.onCancel(...arguments);
      } 
    }
  }
});
