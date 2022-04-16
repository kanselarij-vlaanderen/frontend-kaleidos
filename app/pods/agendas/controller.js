import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';

export default class AgendasController extends Controller {
  queryParams = ['page', 'size', 'sort', 'filter'];

  @service router;
  @service currentSession;
  @service router;

  @tracked isLoadingModel = false;
  @tracked isCreatingNewSession = false;
  @tracked filter = null;
  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-status,created-for.planned-start,created-for.kind.label';

  dateRegex = /^(?:\d{1,2}\/)??(?:\d{1,2}\/)?\d{4}$/;

  @restartableTask
  *debouncedSetFilter(event) {
    yield timeout(500);
    this.setFilter(event.target.value);
  }

  @action
  setFilter(date) {
    if (this.dateRegex.test(date)) {
      this.filter = date;
    } else if (date === '') {
      this.filter = null;
    }
    this.page = 0;
  }

  @action
  clearFilter() {
    this.filter = null;
    this.page = 0;
  }

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
  }

  @action
  successfullyAdded() {
    this.isCreatingNewSession = false;
    this.send('refreshRoute');
    this.router.transitionTo('agendas');
  }

  @action
  async onClickRow(agenda) {
    const meeting = await agenda.createdFor;
    this.router.transitionTo('agenda.agendaitems', meeting.id, agenda.id);
  }

  @action
  sortTable(sortField) {
    this.sort = sortField;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }
}
