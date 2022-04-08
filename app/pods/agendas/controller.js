import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// TODO: determine if these default qp's are still needed here, otherwise refactor to mixin-less solution
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service router;
  @service currentSession;

  @tracked isCreatingNewSession = false;
  @tracked dateFilter = '';
  @tracked sort = '-status,created-for.planned-start';
  @tracked from = null;
  @tracked to = null;
  @tracked page = 0;

  queryParams = ['from', 'to'];
  dateRegex = /^(?:(\d{1,2})-)??(?:(\d{1,2})-)?(\d{4})$/;

  @action
  setDateFilter(date) {
    const newDate = date.split('/').join('-');
    const match = this.dateRegex.exec(newDate);

    if (!match) {
      this.from = null;
      this.to = null;
      return;
    }

    const [, day, month, year] = match.map(num => parseInt(num, 10));

    const from = new Date(year, (month - 1) || 0, day || 0);
    const to = new Date(from);
    if (day) {
      to.setDate(day + 1);
    } else if (month) {
      to.setMonth(month); // months are 0-indexed, no +1 required
    } else {
      to.setYear(year + 1);
    }

    this.from = from.toISOString();
    this.to = to.toISOString();
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
  }

  @action
  async onClickRow(agenda) {
    const meeting = await agenda.createdFor;
    this.router.transitionTo('agenda.agendaitems', meeting.id, agenda.id);
  }
}
