import Component from "@ember/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { fileDownloadPrompt } from 'fe-redpencil/utils/file-utils';

export default Component.extend({
  classNames: ["vl-uploaded-document", "vlc-document-card"],
  showDeleteWarning: false,
  isLoading: false,
  globalError: service(),

  removalWarningText: computed("model.name", function() {
    return `Weet u zeker dat u bestand "${this.get(
      "model.filename"
    )}" wil verwijderen?`;
  }),

  actions: {
    download() {
      fileDownloadPrompt(this.get('model'));
    },

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
          this.onDelete();
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
