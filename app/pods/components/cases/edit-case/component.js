import Component from '@ember/component';

export default Component.extend({

  actions: {
    toggleIsEditing() {
      this.cancelEditing();
    },

    saveChanges() {
      this.set('isLoading', true);
      this.caseToEdit.save().then(() => {
        this.cancelEditing();
        this.set('isLoading', false);
      });
    },
  },
});
