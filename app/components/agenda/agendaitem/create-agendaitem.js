import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  task, timeout, restartableTask
} from 'ember-concurrency';

/**
 * @argument meeting
 * @argument onClose
 * @argument onCreate
 */

export default class CreateAgendaitem extends Component {
  @service store;
  @service subcasesService;
  @service agendaService;

  @tracked selectedSubcases = [];
  @tracked subcases = [];
  @tracked loader = false;

  @tracked page = 0;
  @tracked size = 10;
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
    return this.selectedSubcases.length === 0;
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
      let submissionActivities = yield this.store.query('submission-activity', {
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
        yield submissionActivity.save();
        submissionActivities = [submissionActivity];
      }
      const newItem = yield this.agendaService.putSubmissionOnAgenda(this.args.meeting, submissionActivities);
      agendaItems.push(newItem);
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
      this.selectedSubcases.removeObject(subcase);
    } else {
      this.selectedSubcases.pushObject(subcase);
    }
  };
}
