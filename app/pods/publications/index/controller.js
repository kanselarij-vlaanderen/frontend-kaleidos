import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

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

  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);

  @tracked tableColumnDisplayOptions = JSON.parse(localStorage.getItem('tableColumnDisplayOptions'))
    || tableColumns.reduce((accumulator, currentValue) => {
      accumulator[currentValue.keyName] = currentValue.showByDefault;
      return accumulator;
    }, {});
  tableColumns = tableColumns;

  @tracked showTableDisplayOptions = false;
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-created';

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
  openColumnDisplayOptionsModal() {
    this.showTableDisplayOptions = true;
  }

  @action
  closeColumnDisplayOptionsModal() {
    this.showTableDisplayOptions = false;
  }
}
