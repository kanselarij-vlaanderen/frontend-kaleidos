// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mb-8'],
  isEditing: false,
  itemIndex: 0,
  showIndex: false,
  agendaitem: null,
  newsletterInfo: null,

  allowEditing: true,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    stopEditing() {
      this.set('isEditing', false);
    },
    startEditing() {
      this.set('isEditing', true);
    },
  },

});
