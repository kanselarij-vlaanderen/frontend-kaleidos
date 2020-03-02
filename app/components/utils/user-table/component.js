import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import LightTableMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';
import { observer } from '@ember/object';

export default Component.extend(LightTableMixin, {
  classNames: ['container-flex'],
  modelName: 'user',
  isScrolling: false,
  shouldRefreshTableModel: null,
  sort: 'last-name',

  intl: inject(),
  router: inject(),

  modelObserver: observer('shouldRefreshTableModel', function () {
    if (this.shouldRefreshTableModel) {
      this.initialiseTableBasedOnModel();
      this.set('shouldRefreshTableModel', false);
    }
  }),

  filterObserver: observer('filter', function () {
    this.get("fetchRecords").perform();
  }),

  loadingText: computed('intl', function () {
    return this.intl.t('users-loading-text')
  }),

  actions: {
    async onRowClick(row) {
      //TODO: Route to new page when clicking on row.
      const account = await row.content.account;
      const user = await account.get('user');
      const userId = await user.get('id');
      this.router.transitionTo('settings.users.user', userId);
    },
  }
});
