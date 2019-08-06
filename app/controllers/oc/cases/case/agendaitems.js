import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(isAuthenticatedMixin, DefaultQueryParamsMixin, {
  sort: '-meeting.started-at',
  size: 10,
  caseSearchKey: '',

  actions: {
    searchCase(identifier) {
      this.set('isLoadingModel', true);
      this.store.query('oc-case', {
        filter: {
          ':exact:identifier': identifier
        }
      }).then(cases => {
        this.store.query('oc-agendaitem', {
          filter: {
            'case': {
              'id': cases.firstObject.id
            }
          },
          include: 'meeting'
        }).then(items => {
          this.set('model', items);
          this.set('case', cases.firstObject);
        });
      }).finally(() => {
        this.set('caseSearchKey', '');
        this.set('isLoadingModel', false);
      });
    },

    selectItem(item) {
      this.transitionToRoute('oc.meetings.meeting.agendaitems.agendaitem', item.meeting, item);
    },
  }
});
