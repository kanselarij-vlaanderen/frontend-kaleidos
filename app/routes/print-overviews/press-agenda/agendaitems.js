import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  routeNamePrefix: 'press-agenda',
  sort: 'number',
  include: 'agenda-activity,agenda-activity.subcase',
  shouldFilterRemarks: true,
  currentSession: service(),
  store: service(),
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
      filter['type'] = {
        ':uri:': CONSTANTS.AGENDA_ITEM_TYPES.NOTA,
      };
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
      .then((items) => items.toArray());
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('filter', this.filter);
    controller.set('sort', this.sort);
    controller.set('include', this.include);
  },

  redirect() {
    if (!this.currentSession.may('manage-agendaitems')) {
      this.transitionTo(`print-overviews.${this.routeNamePrefix}.overview`, {
        queryParams: {
          definite: true,
        },
      });
    }
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
