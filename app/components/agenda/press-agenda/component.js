import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-spacer-extended-l', 'vlc-padding-bottom--large'],
  isEditing: false,

  actions: {
    toggleIsEditing(agendaitem) {
      agendaitem.set('isEditing', true);
    }
  }
});
