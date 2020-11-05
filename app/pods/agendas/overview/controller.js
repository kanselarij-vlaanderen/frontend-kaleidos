import Controller from '@ember/controller';
import moment from 'moment';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend(DefaultQueryParamsMixin, {
  sessionService: inject(),
  intl: inject(),
  agendaService: inject(),

  queryParams: ['from', 'to'],
  dateFilter: '',

  dateRegex: /^(?:(\d{1,2})-)?(?:(\d{1,2})-)?(\d{4})$/,

  sort: '-planned-start',
  size: 10,

  activeAgendas: computed('model', async function() {
    const dateOfToday = moment().seconds(0)
      .milliseconds(0)
      .minutes(0)
      .hours(0)
      .utc()
      .subtract(1, 'weeks')
      .format();
    const meetings = await this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
      },
      sort: 'planned-start',
    });
    const activeAgendas = await this.agendaService.getActiveAgendas(dateOfToday);

    return meetings.filter((meeting) => this.checkIfAgendaIsPresent(activeAgendas, meeting));
  }),

  checkIfAgendaIsPresent(activeAgendas, meeting) {
    const foundItem = activeAgendas.find((activeAgenda) => activeAgenda.meeting_id === meeting.id);

    if (!foundItem) {
      return false;
    }
    return true;
  },

  actions: {
    setDateFilter(date) {
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
    },

    clearFilter() {
      this.set('to', null);
      this.set('from', null);
      this.set('dateFilter', '');
    },

    onClickRow(meeting) {
      meeting.get('latestAgenda').then((latestAgenda) => {
        const latestAgendaId = latestAgenda.get('id');
        this.transitionToRoute('agenda.agendaitems', meeting.id, latestAgendaId);
      });
    },
  },
});
