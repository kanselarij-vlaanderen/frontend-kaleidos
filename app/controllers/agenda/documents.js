import Controller from '@ember/controller';

export default Controller.extend({
  isEditing: false,

  actions: {
    cancelEditing() {
      this.toggleProperty('isEditing');
    }
  },
});
