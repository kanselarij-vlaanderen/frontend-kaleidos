import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default Component.extend(isAuthenticatedMixin, {
  globalError: service(),
  classNames: ['vl-u-spacer--large'],
  isLoading: false,

  init() {
    this._super(...arguments);
    this.set('uploadedFiles', A([]));
  },
  
  actions: {
    delete(file) {
      this.get('uploadedFiles').removeObject(file);
    },
    
    add(file) {
      this.get('uploadedFiles').pushObject(file);
    },
    
    save() {
      this.onSave(this.get('uploadedFiles'));
    }
  }
});
