import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom'],
  isEditing: false,
  agenda: null,
  itemIndex: 0,
  definite: false,
  agendaitem: null,
  newsletterInfo: null,

  allowEditing: computed('definite', function () {
    return this.definite === 'false';
  }),

});
