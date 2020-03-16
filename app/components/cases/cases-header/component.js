import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-page-header', 'vl-u-bg-alt'],
  isAddingCase: false,
  actions: {
    toggleAddingCase() {
      this.toggleProperty('isAddingCase');
    },
    close(caze) {
      this.toggleProperty('isAddingCase');
      this.close(caze);
    }
  }
});
