import Controller from '@ember/controller';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import {later} from '@ember/runloop';

export default Controller.extend({
  intl: service(),
  toaster: service(),
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
        label: this.intl.t('email'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        sortable: false, // Should be able to display 'email' and sort on 'emailLink'. This doesn't seem possible with ember-light-table. Sort disabled for now.
        valuePath: 'email',
      },
      {
        label: this.intl.t('ovo-code'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'organization.identifier',
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
    return searchText;
  }),

  actions: {
    showFileUploader() {
      this.toggleProperty('isUploadingFile');
    },
    uploaded(response) {
      if (response && response.status == 200) {
        this.toaster.success(this.intl.t('import-users-success'), this.intl.t('successfully-created-title'));
        later(() => {
          this.send('refresh');
          this.set('shouldRefreshTableModel', true);
        }, 2000);
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    },
    refreshRoute() {
      this.send('refresh');
    }
  }
});
