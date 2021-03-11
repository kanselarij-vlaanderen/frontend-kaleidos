import Component from '@ember/component';

export default Component.extend({
  classNames: ['auk-u-mb-4'],
  isEditing: false,
  itemIndex: 0,
  showIndex: false,
  agendaitem: null,
  newsletterInfo: null,

  allowEditing: true,

  actions: {
    stopEditing() {
      this.set('isEditing', false);
    },
    startEditing() {
      this.set('isEditing', true);
    },
  },

});
