import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  meeting: null,

  selectedSignature: computed('meeting.signature', function() {
    return this.meeting.get('signature');
  }),

  actions: {
    selectSignature(signature) {
      this.set('selectedSignature', signature);
    },

    closeDialog() {
      this.meeting.rollbackAttributes();
      this.closeDialog();
    },

    async saveChanges() {
      this.set('isLoading', true);
      this.meeting.set('signature', await this.selectedSignature);
      this.meeting.save().then(() => {
        this.set('isLoading', false);
        this.closeDialog();
      });
    },
  },
});
