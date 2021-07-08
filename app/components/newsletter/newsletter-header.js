import Component from '@ember/component';

export default Component.extend({
  isAddingSingleNewsLetter: false,

  actions: {
    toggleIsAddingSingleNewsLetter() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
    close() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
  },
});
