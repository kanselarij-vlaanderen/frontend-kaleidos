import Component from "@ember/component";
import { inject } from "@ember/service";
import isAuthenticatedMixin from "fe-redpencil/mixins/is-authenticated-mixin";

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  classNames: ["vlc-page-header"],

  meeting: undefined,
  selectedItem: undefined,

  dropdownOpen: false,

  actions: {
    toggleDropdown() {
      this.toggleProperty("dropdownOpen");
    }
  },

  changeLoading() {
    this.loading();
  }
});
