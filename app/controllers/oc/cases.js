import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
  intl: inject(),

  creatingNewSession: false,
  sort: '-started-at',
  size: 10,

  actions: {
    updateModel() {
      this.get('model').update();
    },

    selectSession(session) {
      this.transitionToRoute('oc.meetings.meeting', session);
    }
  }
});
