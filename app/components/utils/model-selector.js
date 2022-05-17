import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default class UtilsModelSelectrComponent extends Component {
  /**
   * @argument modelName
   * @argument field
   * @argument searchField
   * @argument sortField
   * @argument placeholder
   * @argument disabled
   * @argument allowClear
   * @argument multiple
   * @argument isLoading
   * @argument selected
   * @argument displayField
   * @argument onChange
   * @argument filterOptions: a function that will filter out results from the dropwdown menu
   */
  @service store;
  @tracked items;

  classNameBindings = ['classes'];
  loadingMessage = 'Even geduld aub..';
  noMatchesMessage = 'Geen zoekresultaten gevonden';

  constructor () {
    super(...arguments);

    this.findAll.perform();
  }

  get searchEnabled() {
    // default searchEnabled = false on powerSelect
    // to avoid adding @searchEnabled={{true}} on all uses of this component, we assume search should be enabled when a searchField is given
    return isPresent(this.args.searchField);
  }

  get queryOptions() {
    const options = {};
    const {
      includeField,
    } = this;
    if (this.args.sortField) {
      options.sort = this.args.sortField;
    }
    if (this.args.filter) {
      options.filter = this.args.filter;
    }
    if (includeField) {
      options.include = includeField;
    }
    return options;
  }

  @task
  *findAll() {
    if (this.args.modelName) {
      let items = yield this.store.query(this.args.modelName, this.queryOptions);
      if (this.args.filterOptions) {
        items = this.args.filterOptions(items);
      }
      this.items = items;
    }
  }

  @task
  *searchTask (searchValue) {
    yield timeout(300);
    const queryOptions = this.queryOptions;
    if (queryOptions.filter) {
      queryOptions.filter[this.args.searchField] = searchValue;
    } else {
      const filter = {};
      filter[this.args.searchField] = searchValue;
      queryOptions.filter = filter;
    }

    let results = yield this.store.query(this.args.modelName, queryOptions);
    if (this.args.filterOptions) {
      results = this.args.filterOptions(results);
    }
    return results;
  }
}
