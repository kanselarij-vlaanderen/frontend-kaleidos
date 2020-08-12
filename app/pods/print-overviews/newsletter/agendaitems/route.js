import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  currentSession: service(),

  sort: 'priority',

  model() {
    return this.store
      .query('agendaitem', {
        'filter[agenda][:id:]': this.modelFor('print-overviews.newsletter').get('id'),
        'filter[show-as-remark]': false,
        include: 'treatments,treatments.newsletter-info',
        sort: this.get('sort'),
        page: {
          size: 9999,
          number: 0,
        },
      })
      .then((items) => items.toArray());
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('sort', this.sort);
  },

  actions: {
    refresh() {
      this.refresh();
    },
  },
});
