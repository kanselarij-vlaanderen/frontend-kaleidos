import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsIndexController extends Controller {
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
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  closeFilterTableModal() {
    localStorage.setItem('tableColumnDisplayOptions', JSON.stringify(this.tableColumnDisplayOptions));
    this.showTableDisplayOptions = false;
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
  showFilterModal() {
    this.isShowPublicationFilterModal = true;
  }

  @action
  cancelPublicationsFilter() {
    this.isShowPublicationFilterModal = false;
  }

  @action
  savePublicationsFilter(publicationFilter) {
    this.publicationFilter = publicationFilter;
    localStorage.setItem('publicationFilter', this.publicationFilter.toString());
    this.isShowPublicationFilterModal = false;
    this.send('refreshModel');
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.set('page', this.page - 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    }
  }

  @action
  nextPage() {
    this.set('page', this.page + 1);  // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  }

  @action
  setSizeOption(size) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    this.set('size', size);
    this.set('page', 0);
  }

  @action
  sortTable(sortField) {
    this.set('sort', sortField);
  }
}
