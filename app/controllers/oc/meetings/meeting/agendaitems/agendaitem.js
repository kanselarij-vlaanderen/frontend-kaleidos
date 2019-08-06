import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
  globalError: service(),

  isLoading: false,
  showAddNotification: false,
  showAddDocuments: false,

  actions: {
    showAddNotification() {
      this.set('showAddNotification', true);
    },

    showAddDocuments() {
      this.set('showAddDocuments', true);
    },

    saveDocuments(documents) {
      this.set('isLoading', true);
      let savePromises = documents.filter(doc => doc.hasDirtyAttributes).invoke('save');
      this.get('model.documents').then(docs => {
        docs.addObjects(documents);
      });
      Promise.all(savePromises)
        .then(() => {
          this.get('model')
            .save()
            .then(() => {
              this.set('showAddDocuments', false);
            });
        })
        .catch(error => {
          this.globalError.handleError(error);
        });
    },

    saveNotification(documents) {
      this.set('isLoading', true);
      let notification = documents.objecAt(0);
      this.set('model.notification', notification);
      notification
        .save()
        .then(() => {
          this.get('model')
            .save()
            .then(() => {
              this.set('showAddNotification', false);
            });
        })
        .catch(error => {
          this.globalError.handleError(error);
        });
    },

    cancel() {
      this.set('showAddDocuments', false);
      this.set('showAddNotification', false);
    }
  }
});
