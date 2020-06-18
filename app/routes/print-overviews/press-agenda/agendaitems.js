import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  authenticationRoute: 'login',
  routeNamePrefix: 'press-agenda',
  sort: 'priority',
  include: 'subcase',
  shouldFilterRemarks: true,
  currentSession: service(),
  modelName: 'agendaitem',
  filter: null,
  page: 0,
  size: 9999,

  model() {
    const filter = {
      agenda: {
        id: this.modelFor(`print-overviews.${this.routeNamePrefix}`).get('id'),
      },
    };
    if (this.shouldFilterRemarks) {
      filter['show-as-remark'] = false;
    }
    this.set('filter', filter);
    return this.store
      .query(this.get('modelName'), {
        filter,
        include: this.get('include'),
        sort: this.get('sort'),
        page: {
          size: this.get('size'),
          number: this.get('page'),
        },
      })
      .then((items) => {
        return items.toArray();
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('filter', this.filter);
    controller.set('sort', this.sort);
    controller.set('include', this.include);
  },

  redirect() {
    if (!this.currentSession.isEditor) {
      this.transitionTo(`print-overviews.${this.routeNamePrefix}.overview`, {
        queryParams: { definite: true },
      });
    }
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
