import Component from '@ember/component';
import { inject } from "@ember/service";
import { task, timeout } from "ember-concurrency";
import { computed, observer } from "@ember/object";


export default Component.extend({

  store: inject(),

  size: 5,
  sort: "title",

  documents: computed("items.@each", function() {
    (this.get("items") || []).map(item => item.set("selected", false));
    return this.items;
  }),

  // dirty observers to make use of the datatable actions
  pageObserver: observer("page", function() {
    this.findAll.perform();
  }),

  queryOptions: computed("sort", "filter", "page", function() {
    const { page, filter, size, sort } = this;
    let options = {
      sort: sort,
      page: {
        number: page,
        size: size
      },
      filter: {},
    };
    if (filter) {
      options["filter"]["title"] = filter;
    }
    return options;
  }),

  findAll: task(function*() {
    const { queryOptions } = this;
    const items = yield this.store.query("document", queryOptions);
    this.set("items", items);
    yield timeout(100);
  }),

  searchTask: task(function*() {
    yield timeout(300);
    const { queryOptions } = this;
    const items = yield this.store.query("document", queryOptions);
    this.set("items", items);
    yield timeout(100);
  }).restartable(),

  async didInsertElement() {
    this._super(...arguments);
    this.set("availableSubcases", []);
    this.set("postponedSubcases", []);
    this.findAll.perform();
  },

  actions: {
    async select(document, event) {
      if (event) {
        event.stopPropagation();
      }
      if (document.selected) {
        document.set("selected", false);
        this.delete(document)
      } else {
        document.set("selected", true);
        this.add(document)
      }
    }
  }


});
