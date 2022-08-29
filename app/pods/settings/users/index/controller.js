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
  @service router;

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
        this.send('refreshRoute');
      }
    } catch {
      this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
    }
  }

  @action
  refresh() {
    this.send('refreshRoute');
  }

  @action
  goToRoute(route, param) {
    this.router.transitionTo(route, param);
  }

  @tracked checked = false;
  @tracked itemActivated = true;

  @action
  checkAll() {
    this.checked = !this.checked;
  }

  @tracked showActivateAll = false;

  @action
  activateAll() {
    this.showActivateAll = !this.showActivateAll;
  }

  @action
  activateAllToggle() {
    this.showActivateAll = !this.showActivateAll;
    this.itemActivated = true;
    this.toaster.success("De status van 2 gebruikers is successvol gewijzigd", "Gelukt!");
  }

  @tracked showDisableAll = false;

  @action
  disableAll() {
    this.showDisableAll = !this.showDisableAll;
  }

  @action
  disableAllToggle() {
    this.showDisableAll = !this.showDisableAll;
    this.itemActivated = false;
    this.toaster.success("De status van 8 gebruikers is successvol gewijzigd", "Gelukt!");
  }

  @tracked showBlockAll = false;

  @action
  blockAll() {
    this.showBlockAll = !this.showBlockAll;
  }

  @tracked showBlock = false;

  @action
  block() {
    this.showBlock = !this.showBlock;
  }
}
