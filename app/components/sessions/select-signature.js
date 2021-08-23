// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  meeting: null,

  selectedSignature: computed('meeting.signature', function() {
    return this.meeting.get('signature');
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
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
