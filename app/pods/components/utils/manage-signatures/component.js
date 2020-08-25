import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  store: inject(),
  isAdding: false,
  isEditing: false,

  defaultSignature: computed('store', function() {
    return DS.PromiseObject.create({
      promise: this.store.query('signature', {
        filter: {
          'is-active': true,
        },
      }).then((signatures) => signatures.objectAt(0)),
    });
  }),

  actions: {
    closeModal() {
      this.closeModal();
    },

    selectSignature(signature) {
      this.set('selectedSignature', signature);
    },

    async setDefaultSignature() {
      const currentDefault = await this.get('defaultSignature');
      if (currentDefault) {
        currentDefault.set('isActive', false);
        await currentDefault.save();
      }
      const signatureToSetActive = await this.get('selectedSignature');
      signatureToSetActive.set('isActive', true);
      signatureToSetActive.save().then((newDefault) => {
        this.set('defaultSignature', newDefault);
        signatureToSetActive.reload();
        if (currentDefault) {
          currentDefault.reload();
        }
      });
    },

    toggleIsAdding() {
      this.toggleProperty('isAdding');
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    personSelected(person) {
      this.set('selectedPerson', person);
    },
  },
});
