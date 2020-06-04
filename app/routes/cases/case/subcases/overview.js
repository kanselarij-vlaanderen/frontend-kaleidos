import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  queryParams: {
    refresh: {
      refreshModel: true
    }
  },
// TODO KAS-1425
  async model() {
    const caze = this.modelFor('cases.case');

    let subcases = await this.store.query('subcase', {
      filter: {
        case: { id: caze.get('id') },
      },
      // include: 'phases',
      sort: '-created',
    });

    return hash({
      subcases: subcases,
      case: caze
    });
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }

});
