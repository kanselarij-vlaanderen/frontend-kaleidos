import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class SettingsOrganisationsController extends Controller {
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

  @tracked showBlock = false;

  @action
  block() {
    this.showBlock = !this.showBlock;
  }

  @action
  addBlock() {
    this.showBlock = !this.showBlock;
    this.toaster.success("Organisatie geblokkeerd.");
  }

  @tracked showUnblock = false;

  @action
  unblock() {
    this.showUnblock = !this.showUnblock;
  }

  @action
  addUnblock() {
    this.showUnblock = !this.showUnblock;
    this.toaster.success("Organisatie gedeblokkeerd.");
  }

  @tracked showArchive = false;

  @action
  archive() {
    this.showArchive = !this.showArchive;
  }

  @action
  addArchive() {
    this.showArchive = !this.showArchive;
    this.toaster.success("120 gebruikers gearchiveerd.");
  }
}
