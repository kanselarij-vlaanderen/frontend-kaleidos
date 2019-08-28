import Component from "@ember/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend({
  showDeleteWarning: false,
  isLoading: false,
  globalError: service(),

  removalWarningText: computed("model.name", function() {
    return `Weet u zeker dat u bestand "${this.get(
      "model.filename"
    )}" wil verwijderen?`;
  }),

  actions: {
    promptDelete() {
      this.set("showDeleteWarning", true);
      this.get("model").deleteRecord();
    },

    cancelDelete() {
      this.get("model").rollbackAttributes();
      this.set("showDeleteWarning", false);
    },

    confirmDelete() {
      this.set("isLoading", true);
      this.get("model")
        .save()
        .then(() => {
          this.set("showDeleteWarning", false);
          if (this.onDelete) {
            this.onDelete();
          }
        })
        .catch(error => {
          this.globalError.handleError(error);
        })
        .finally(() => {
          this.set("isLoading", false);
        });
    }
  }
});
