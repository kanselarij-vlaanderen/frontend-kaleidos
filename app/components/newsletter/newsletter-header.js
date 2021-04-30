import Component from '@ember/component';

export default Component.extend({
  classNames: ['auk-navbar', 'auk-navbar--bordered-bottom', 'auk-navbar--gray-100'],
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
