import Component from "@ember/component";
import isAuthenticatedMixin from "fe-redpencil/mixins/is-authenticated-mixin";
import { computed } from "@ember/object";

export default Component.extend(isAuthenticatedMixin, {
  classNames: ["vl-u-bg-alt"],
  isAddingSubcase: false,
  title: null,
  shortTitle: null,

  activeProcess: computed("isShowingProcess", function() {
    if (this.get("isShowingProcess")) {
      return "vlc-tabs-reverse__link--active";
    }
  }),

	// This is needed to give the input-helpers a proper string instead of
	// a promise object based on the previous subcase or known case
  async setKnownPropertiesOfCase() {
    const caze = await this.get("model.case");
    const latestSubcase = await caze.get("latestSubcase");
    if (latestSubcase) {
      this.set("title", latestSubcase.get("title"));
      this.set("shortTitle", latestSubcase.get("shortTitle"));
    } else {
      this.set("title", caze.title);
      this.set("shortTitle", caze.shortTitle);
    }
  },

  actions: {
    async toggleIsAddingSubcase() {
      await this.setKnownPropertiesOfCase();
      this.toggleProperty("isAddingSubcase");
    },

    refresh() {
      this.refresh();
    },

    close() {
      this.toggleProperty("isAddingSubcase");
    },

    toggleIsShowingProcess() {
      this.set("isShowingProcess", true);
    },

  }
});
