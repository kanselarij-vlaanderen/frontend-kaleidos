import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// TODO: determine if these default qp's are still needed here, otherwise refactor to mixin-less solution
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service currentSession;

  @tracked isCreatingNewSession = false;


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
    this.transitionToRoute('agendas.overview');
  }

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  dateRegex = /^(?:(\d{1,2})-)?(?:(\d{1,2})-)?(\d{4})$/;

  @action setDateFilter(date) {
    const newDate = date.split('/').join('-');
    const match = this.dateRegex.exec(newDate);
    if (!match) {
      this.set('from', undefined);
      this.set('to', undefined);
      return;
    }
    const min = moment(parseInt(match[3], 10), 'YYYY', true);
    let unitToAdd;
    if (match[1] && match[2]) {
      unitToAdd = 'day';
      min.set('date', parseInt(match[1], 10));
      min.set('month', parseInt(match[2], 10) - 1); // Count starts from 0
    } else if (match[1]) {
      unitToAdd = 'month';
      min.set('month', parseInt(match[1], 10) - 1);
    } else {
      unitToAdd = 'year';
    }
    const max = min.clone().add(1, `${unitToAdd}s`);

    this.set('from', min.format('YYYY-MM-DD'));
    this.set('to', max.format('YYYY-MM-DD'));
    this.set('page', 0);
  }

  @action clearFilter() {
    this.set('to', null);
    this.set('from', null);
    this.set('dateFilter', '');
  }

  @action onClickRow(meeting) {
    meeting.get('latestAgenda').then((latestAgenda) => {
      const latestAgendaId = latestAgenda.get('id');
      this.transitionToRoute('agenda.agendaitems', meeting.id, latestAgendaId);
    });
  }
}
