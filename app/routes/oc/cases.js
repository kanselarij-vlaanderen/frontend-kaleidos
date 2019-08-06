import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  beforeModel() {
    return this.store.query('oc-case', { // Transition to random case
      page: {
        'size': 1,
        'number': 0
      },
    }).then(cases => {
      this.transitionTo('oc.cases.case.agendaitems', cases.firstObject);
    });
  },
});
