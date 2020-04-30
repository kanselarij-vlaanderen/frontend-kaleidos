import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {later} from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';


export default class UsersSettingsController extends Controller {
  @service intl;
  @service toaster;

  isUploadingFile = null;
  size = 10;
  page = 0;
  queryParams = ['filter'];
  @tracked filterText = '';

  get filter() {
    const searchText = this.get('filterText');
    if (isEmpty(searchText)) {
      return null;
    }
    return searchText;
  }

  set filter(param) {
    this.filterText = param;
  }

  @action
  showFileUploader() {
    this.toggleProperty('isUploadingFile');
  }

  @action
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
  }

  @action
  refreshRoute() {
    this.send('refresh');
  }
}
