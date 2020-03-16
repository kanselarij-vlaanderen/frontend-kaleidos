import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  router: service(),

  model() {
    return this.store.query('user', {
      include: 'group,organization',
      sort: 'first-name'
    }).then(users => users.toArray());
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
