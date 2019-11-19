import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-display-block'],
  options: null,
  selectedOption: null,
  isOc: null,

  actions: {
    async logout() {
      await this.logoutUser();
    },
    setAction(option) {
      this.navigateToRoute(option);
    },
  },
});
