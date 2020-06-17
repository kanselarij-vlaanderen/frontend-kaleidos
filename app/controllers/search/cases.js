import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CasesSearchController extends Controller {
  queryParams =[{
    decisionsOnly: { type: 'boolean' },
    page: { type: 'number' },
    size: { type: 'number' },
    sort: { type: 'string'}
  }];

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked decisionsOnly;

  @tracked emptySearch;

  constructor () {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.decisionsOnly = false;
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  toggleDesisionsOnly() {
    this.toggleProperty('desicionsOnly');
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }
}
