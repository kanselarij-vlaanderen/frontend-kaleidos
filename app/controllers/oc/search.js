import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(isAuthenticatedMixin, DefaultQueryParamsMixin, {
  sort: '-meeting.started-at',
  size: 10,

  actions: {
    search(term) {
      this.set('term', term);
    },

    selectItem(item) {
      this.transitionToRoute('oc.meetings.meeting.agendaitems.agendaitem', item.meeting, item);
    },
  }
});
