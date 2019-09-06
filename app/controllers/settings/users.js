import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Controller.extend({
  intl: inject(),
  globalError: inject(),
  isUploadingFile: null,

  columns: computed(function() {
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
        label: this.intl.t('national-number'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
				breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'account.voId',
      },
      {
        label: this.intl.t('group'),
        classNames: ['vl-data-table-col-4 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-4'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'group',
        sortable: true,
        cellComponent: 'web-components/light-table/vl-group-column',
      },
    ];
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
				this.send('refresh');
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
  },
});
