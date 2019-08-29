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
      startedAt = moment(startedAt)
        .utc()
        .toDate();
      this.set('model.startedAt', startedAt);
      const modified = moment()
        .utc()
        .toDate();
      this.set('model.modified', modified);
    },

    save() {
      const { extraInfo } = this;
      const dateOfToday = moment()
        .utc()
        .toDate();
      this.set('isLoading', true);
      this.set('extraInfo', extraInfo);
      if (this.get('model')) {
        this.set('model.startedAt', dateOfToday);
      }
      this.get('model')
        .save()
        .catch((error) => {
          this.globalError.handleError(error);
        })
        .finally(() => {
          this.set('isLoading', false);
          this.parentController.send('updateModel');
          this.transitionToRoute('oc.meetings.index');
        });
    },

    setKind(kind) {
      this.set('selectedKindUri', kind);
    },

    cancel() {
      this.transitionToRoute('oc.meetings.index');
    },
  },
});
