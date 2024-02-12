import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { action } from '@ember/object';
import {
  task, timeout, restartableTask
} from 'ember-concurrency';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument meeting
 * @argument onClose
 * @argument onCreate
 */

export default class CreateAgendaitem extends Component {
  @service store;
  @service subcasesService;
  @service agendaService;
  @service toaster;
  @service intl;

  @tracked selectedSubcases = new TrackedArray([]);
  @tracked subcases = [];
  @tracked loader = false;

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked filter = '';
  @tracked sort = 'short-title';

  constructor() {
    super(...arguments);

    this.findAll.perform();
  }

  get queryOptions() {
    const options = {
      sort: this.sort,
      page: {
        number: this.page,
        size: this.size,
      },
      filter: {
        ':has-no:agenda-activities' : 'yes',
      }
    };
    if (this.filter) {
      options.filter['short-title'] = this.filter;
    }
    return options;
  }

  get isSaveDisabled() {
    return (
      this.selectedSubcases.length === 0 ||
      this.addSubcasesToAgenda.isRunning
    );
  }

  setFocus() {
    const element = document.getElementById('searchId');
    if (element) {
      element.focus();
    }
  };

  @task
  *findAll() {
    this.subcases = yield this.store.query('subcase', this.queryOptions);
    yield timeout(100);
    this.setFocus();
  };

  @restartableTask()
  *searchTask() {
    yield timeout(300);
    yield this.findAll.perform();
  };

  @task
  *addSubcasesToAgenda() {
    const subcasesToAdd = new Set([...this.selectedSubcases]);
    const agendaItems = [];
    for (const subcase of subcasesToAdd) {
      try {
        const newItem = yield this.agendaService.putSubmissionOnAgenda(this.args.meeting, subcase);
        agendaItems.push(newItem);
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
          this.intl.t('warning-title')
        );
      }
    }

    this.args.onCreate(agendaItems);
  };

  @action
  selectSize(size) {
    this.page = 0;
    this.size = size;
    this.findAll.perform();
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.findAll.perform();
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
    this.findAll.perform();
  }

  @action
  onSortChange(sortField) {
    this.sort = sortField;
    this.findAll.perform();
  }

  @action
  selectSubcase(subcase) {
    if (this.selectedSubcases.includes(subcase)) {
      removeObject(this.selectedSubcases, subcase);
    } else {
      this.selectedSubcases.push(subcase);
    }
  };
}
