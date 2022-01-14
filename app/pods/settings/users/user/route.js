import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  store: service(),

  model(params) {
    return this.store.findRecord('user', params.id);
  },
});
