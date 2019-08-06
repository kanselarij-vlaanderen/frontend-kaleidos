import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
  globalError: service(),

  parentController: controller('oc.meetings'),

  isLoading: false, 
  
  actions: {
    setSessionDate(startedAt) {
      startedAt = moment(startedAt).utc().toDate();
      this.set('model.startedAt', startedAt);
      const modified = moment().utc().toDate();
      this.set('model.modified', modified);
    },

    save() {
      this.set('isLoading', true);
      this.get('model').save()
        .catch((error) => {
        this.globalError.handleError(error);
      }).finally(() => {
        this.set('isLoading', false);
        this.parentController.send('updateModel');
        this.transitionToRoute('oc.meetings.index');
      });
    },

    cancel() {
      this.transitionToRoute('oc.meetings.index');
    },
  }
});
