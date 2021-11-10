import Route from '@ember/routing/route';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  model(params) {
    return this.store.findRecord('subcase', params.subcase_id,
      {
        reload: true,
      }).then((subcase) => subcase);
  },

  async afterModel(model) {
    await model.case.get('governmentAreas');
    await this.store.query('government-field', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      include: 'domain',
    });
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
