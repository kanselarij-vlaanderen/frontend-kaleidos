import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  queryParams: {
    refresh: {
      refreshModel: true,
    },
  },
  async model() {
    const caze = this.modelFor('cases.case');

    const subcases = await this.store.query('subcase', {
      filter: {
        case: {
          id: caze.get('id'),
        },
      },
      sort: '-created',
    });

    return hash({
      subcases,
      case: caze,
    });
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },

});
