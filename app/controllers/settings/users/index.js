import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { isEmpty } from '@ember/utils';
import EmberObject from '@ember/object';
import { later } from '@ember/runloop';

export default Controller.extend({
  intl: inject(),
  globalError: inject(),
  isUploadingFile: null,
  shouldRefreshTableModel: null,
  filterText: null,

  columns: computed(function () {
    return [
      {
        label: this.intl.t('first-name'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        sortable: true,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'firstName',
      },
      {
        label: this.intl.t('last-name'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        sortable: true,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'lastName',
      },
      {
        label: this.intl.t('phone'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'account.phone',
      },
      {
        label: this.intl.t('email'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'account.voEmail',
      },
      {
        label: this.intl.t('group'),
        classNames: ['vl-data-table-col-3 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-3'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'group.name',
        sortable: true,
      },
      {
        classNames: ['vl-data-table-col-1'],
        cellClassNames: ['vl-data-table-col-1'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        sortable: false,
        cellComponent: 'web-components/light-table/vlc-user-table-actionbar',
      },
    ];
  }),

  filter: computed('filterText', function () {
    const searchText = this.get('filterText');
    if (isEmpty(searchText)) {
      return null;
    }
    return { "last-name": searchText };
  }),

  actions: {
    showFileUploader() {
      this.toggleProperty('isUploadingFile');
    },
    uploaded(response) {
      if (response && response.status == 200) {
        this.globalError.showToast.perform(
          EmberObject.create({
            title: this.intl.t('successfully-created-title'),
            message: this.intl.t('import-users-success'),
            type: 'success',
          })
        );
        later(() => {
          this.send('refresh');
          this.set('shouldRefreshTableModel', true);
        }, 2000);
      } else {
        this.globalError.showToast.perform(
          EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error'),
            type: 'error',
          })
        );
      }
    },
  }
});
