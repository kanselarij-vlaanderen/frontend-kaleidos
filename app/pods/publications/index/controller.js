import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import configElements from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class PublicationsIndexController extends Controller {
  @tracked filterTableColumnOptionKeys = JSON.parse(localStorage.getItem('filterTableColumnOptionKeys'))
    || configElements.reduce((accumulator, currentValue) => {
      accumulator[currentValue.keyName] = currentValue.showByDefault;
      return accumulator;
    }, {});

  @tracked showFilterTableModal = false;
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

  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-created';

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  closeFilterTableModal() {
    localStorage.setItem('filterTableColumnOptionKeys', JSON.stringify(this.filterTableColumnOptionKeys));
    this.showFilterTableModal = false;
  }

  @action
  changeColumnDisplayOptions(options) {
    this.filterTableColumnOptionKeys = options;
    localStorage.setItem('filterTableColumnOptionKeys', JSON.stringify(this.filterTableColumnOptionKeys));
  }

  @action
  openColumnDisplayOptionsModal() {
    this.showFilterTableModal = true;
  }

  @action
  closeColumnDisplayOptionsModal() {
    this.showFilterTableModal = false;
  }
}
