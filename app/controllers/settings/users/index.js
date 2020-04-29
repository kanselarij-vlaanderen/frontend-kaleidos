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
  filterText: '',

  // filter: computed('filterText', function () {
  //   const searchText = this.get('filterText');
  //   if (isEmpty(searchText)) {
  //     return null;
  //   }
  //   return searchText;
  // }),

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
