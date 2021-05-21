import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { computed } from '@ember/object';
import {
  task, timeout
} from 'ember-concurrency';
export default Component.extend(DataTableRouteMixin, {
  availableSubcases: null,
  showPostponed: null,
  noItemsSelected: true,

  currentSession: alias('sessionService.currentSession'),
  selectedAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),

  store: inject(),
  subcasesService: inject(),
  agendaService: inject(),
  sessionService: inject(),

  modelName: 'subcase',
  page: 0,
  size: 10,
  filter: '',
  sort: 'short-title',
  queryOptions: computed('sort', 'filter', 'page', 'size', function() {
    const {
      page, filter, size, sort,
    } = this;
    const options = {
      sort,
      page: {
        number: page,
        size,
      },
      filter: {
        ':has-no:agenda-activities': 'yes',
        ':not:is-archived': 'true',
      },
    };

    if (filter) {
      options.filter['short-title'] = filter;
    }
    return options;
  }),
  onCreate: null, // argument. Function that is triggered after agenda-item creation.

  get pageParam() {
    return this.page;
  },

  get sizeParam() {
    return this.size;
  },

  set pageParam(page) {
    this.set('page', page);
    this.findAll.perform();
  },

  set sizeParam(size) {
    this.set('size', size);
    this.findAll.perform();
  },

  get filterParam() {
    return this.filter;
  },

  set filterParam(filter) {
    this.set('filter', filter);
    this.set('page', 0);
    this.set('size', 10);
  },

  get sortParam() {
    return this.sort;
  },

  set sortParam(sort) {
    this.set('sort', sort);
    this.findAll.perform();
  },

  model: computed('items.@each', function() {
    (this.get('items') || []).map((item) => item.set('selected', false));
    return this.items;
  }),

  setFocus() {
    const element = document.getElementById('searchId');
    if (element) {
      element.focus();
    }
  },

  findAll: task(function *() {
    const {
      queryOptions,
    } = this;
    const items = yield this.store.query('subcase', queryOptions);
    this.set('items', items);
    yield timeout(100);
    this.setFocus();
  }),

  findPostponed: task(function *() {
    const ids = yield this.get('subcasesService').getPostPonedSubcaseIds();
    let postPonedSubcases = [];

    if (ids && ids.length > 0) {
      postPonedSubcases = yield this.store.query('subcase', {
        filter: {
          id: ids.toString(),
        },
      });
    }
    this.set('items', postPonedSubcases);
  }),

  searchTask: task(function *() {
    yield timeout(300);
    const {
      queryOptions,
    } = this;
    const items = yield this.store.query('subcase', queryOptions);
    this.set('items', items);
    yield timeout(100);
    this.setFocus();
  }).restartable(),

  async didInsertElement() {
    this._super(...arguments);
    this.set('availableSubcases', []);
    this.set('postponedSubcases', []);
    this.findAll.perform();
  },

  actions: {
    selectSize(size) {
      this.size = size;
    },

    close() {
      this.set('isAddingAgendaitems', false);
    },

    checkShowPostponedValue() {
      const {
        showPostponed,
      } = this;
      if (showPostponed) {
        this.findPostponed.perform();
      } else {
        this.findAll.perform();
      }
    },

    async selectPostponed(subcase, event) {
      if (event) {
        event.stopPropagation();
      }
      let action = 'add';
      if (subcase.selected) {
        subcase.set('selected', false);
        action = 'remove';
      } else {
        subcase.set('selected', true);
        action = 'add';
        this.set('noItemsSelected', false);
      }
      const postponed = await this.get('postponedSubcases');

      if (action === 'add') {
        postponed.pushObject(subcase);
      } else if (action === 'remove') {
        const index = postponed.indexOf(subcase);
        if (index > -1) {
          postponed.splice(index, 1);
        }
        if (!postponed.length) {
          this.set('noItemsSelected', true);
        }
      }
    },

    // eslint-disable-next-line no-unused-vars
    async selectAvailableSubcase(subcase, destination, event) {
      if (event) {
        event.stopPropagation();
      }

      let action = 'add';
      if (subcase.selected) {
        subcase.set('selected', false);
        action = 'remove';
      } else {
        subcase.set('selected', true);
        action = 'add';
      }

      const available = await this.get('availableSubcases');

      if (action === 'add') {
        available.pushObject(subcase);
      } else if (action === 'remove') {
        const index = available.indexOf(subcase);
        if (index > -1) {
          available.splice(index, 1);
        }
      }
    },

    async addSubcasesToAgenda() {
      this.set('loading', true);
      const {
        availableSubcases,
        postponedSubcases,
      } = this;
      const subcasesToAdd = [...new Set([...postponedSubcases, ...availableSubcases])];
      const agendaItems = [];
      for (const subcase of subcasesToAdd) {
        let submissionActivities = await this.store.query('submission-activity', {
          'filter[subcase][:id:]': subcase.id,
          'filter[:has-no:agenda-activity]': true,
        });
        submissionActivities = submissionActivities.toArray();
        if (!submissionActivities.length) {
          const now = new Date();
          const submissionActivity = this.store.createRecord('submission-activity', {
            startDate: now,
            subcase,
          });
          await submissionActivity.save();
          submissionActivities = [submissionActivity];
        }
        const newItem = await this.agendaService.putSubmissionOnAgenda(this.currentSession, submissionActivities);
        agendaItems.push(newItem);
      }

      this.set('loading', false);
      this.set('isAddingAgendaitems', false);
      if (this.onCreate) {
        this.onCreate(agendaItems);
      }
    },
  },
});
