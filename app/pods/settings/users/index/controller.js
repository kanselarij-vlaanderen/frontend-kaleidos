import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class UsersSettingsController extends Controller {
  queryParams = ['filter'];

  @service intl;
  @service toaster;

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);
  isUploadingFile = null;

  @tracked size = 10;
  @tracked page = 0;
  @tracked filterText = '';

  get filter() {
    const searchText = this.filterText;
    if (isEmpty(searchText)) {
      return null;
    }
    return searchText;
  }

  set filter(param) {
    this.page = 0;
    this.filterText = param;
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  showFileUploader() {
    this.isUploadingFile = !this.isUploadingFile;
  }

  @task
  *uploadUserFile(file) {
    try {
      const response = yield file.upload('/user-management/import-users');
      if (response && response.status === 200) {
        this.toaster.success(this.intl.t('import-users-success'), this.intl.t('successfully-created-title'));
        this.send('refresh');
      }
    } catch {
      this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
    }
  }

  @action
  refreshRoute() {
    this.send('refresh');
  }

  @action
  goToRoute(route, param) {
    this.transitionToRoute(route, param);
  }
}
