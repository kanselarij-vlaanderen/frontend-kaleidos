import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewBaseController extends Controller {

  @service router;

  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = '-identification.structured-identifier.local-identifier';

  @tracked tableConfig;

  @tracked isLoadingModel = false;

  @action
  saveTableConfig() {
    this.tableConfig.saveToLocalStorage();
    // refreshes the active route, which could mean any of the tabs that extend _base route
    this.router.refresh(this.router.currentRouteName);
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }

  @action
  sortTable(sortField) {
    this.sort = sortField;
  }
}
