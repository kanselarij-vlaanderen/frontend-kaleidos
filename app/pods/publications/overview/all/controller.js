import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class PublicationsOverviewAllController extends Controller {
  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  @service publicationService;

  page = 0;
  size = 10;
  sort = '-created';

  @tracked tableColumnDisplayOptions = JSON.parse(localStorage.getItem('tableColumnDisplayOptions'))
    || tableColumns.reduce((accumulator, currentValue) => {
      accumulator[currentValue.keyName] = currentValue.showByDefault;
      return accumulator;
    }, {});
  tableColumns = tableColumns;

  @tracked isLoadingModel = false;
  @tracked showTableDisplayOptions = false;
  @tracked isShowPublicationModal = false;

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  changeColumnDisplayOptions(options) {
    this.tableColumnDisplayOptions = options;
    localStorage.setItem('tableColumnDisplayOptions', JSON.stringify(this.tableColumnDisplayOptions));
  }

  @action
  toggleColumnDisplayOptions() {
    this.showTableDisplayOptions = !this.showTableDisplayOptions;
  }

  @action
  showPublicationModal() {
    this.isShowPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isShowPublicationModal = false;
  }

  @action
  async saveNewPublication(publication) {
    const newPublication = await this.publicationService.createNewPublicationWithoutMinisterialCouncil(publication, {
      decisionDate: publication.decisionDate,
    });
    this.closePublicationModal();
    this.transitionToRoute('publications.publication', newPublication.get('id'));
  }

  @action
  prevPage() {
    if (this.page > 0) {
      set(this, 'page', this.page - 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    }
  }

  @action
  nextPage() {
    set(this, 'page', this.page + 1);  // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  }

  @action
  setSizeOption(size) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    set(this, 'size', size);
    set(this, 'page', 0);
  }

  @action
  sortTable(sortField) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    set(this, 'sort', sortField);
  }
}
