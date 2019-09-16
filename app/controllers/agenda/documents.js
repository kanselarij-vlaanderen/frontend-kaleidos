import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
  isEditing: false,

  actions: {
    cancelEditing() {
      this.toggleProperty('isEditing');
    }
	},
});
