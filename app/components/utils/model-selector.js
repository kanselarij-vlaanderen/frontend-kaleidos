import Component from '@glimmer/component';
import { action } from '@ember/object';
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
   * @argument selectedItems
   * @argument onChange
   * @argument filterOptions: a function that will filter out results from the dropwdown menu
   */
  @service store;

  classNameBindings = ['classes'];
  propertyToShow = null;
  loadingMessage = 'Even geduld aub..';
  noMatchesMessage = 'Geen zoekresultaten gevonden';
  @tracked _queryOptions = {};

  constructor () {
    super(...arguments);

    this.findAll.perform();
  }

  get searchEnabled() {
    // default searchEnabled = false on powerSelect
    // to avoid adding @searchEnabled={{true}} on all uses of this component, we assume search should be enabled when a searchField is given
    return isPresent(this.args.searchField);
  }

  set queryOptions(options) {
    this._queryOptions = options;
  }

  get queryOptions() {
    if (this._queryOptions) {
      return this._queryOptions;
    }
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
    const {
      queryOptions, modelName,
    } = this;
    if (queryOptions.filter) {
      queryOptions.filter[this.args.searchField] = searchValue;
    } else {
      const filter = {};
      filter[this.args.searchField] = searchValue;
      queryOptions.filter = filter;
    }

    let results = yield this.store.query(modelName, queryOptions);
    if (this.args.filterOptions) {
      results = this.args.filterOptions(results);
    }
    return results;
  }

  @action
  resetValueIfEmpty(param) {
    if (param === '') {
      this.queryOptions = {
        sort: this.args.sortField,
      };
      this.findAll.perform();
    }
  }
}
