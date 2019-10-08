import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
  sessionService: inject(),
  intl: inject(),
  agendaService: inject(),

  queryParams: ['from', 'to'],
  dateFilter: '',
  
  creatingNewSession: false,
  sort: '-planned-start',
  size: 10,

  dateRegex: /^(?:(\d{1,2})-)?(?:(\d{1,2})-)?(\d{4})$/,
  
  nearestMeeting: computed('model', async function() {
    const nearestMeeting = await this.agendaService.getClosestMeetingAndAgendaIdInTheFuture(
      moment()
        .utc()
        .toDate()
    );
    const meetings = this.get('model');

    const nearestMeetingInModel = meetings.find(
      item => item.get('id') === nearestMeeting.meeting_id
    );
    if (nearestMeetingInModel) {
      nearestMeetingInModel.set('isNearest', true);
      return [nearestMeetingInModel];
    } else {
      return [this.store.findRecord('meeting', nearestMeeting.meeting_id)];
    }
  }),

  futureMeetings: computed('model', 'nearestMeeting', function() {
    const meetings = this.get('model');
    const nearestMeetingDate = moment(this.get('nearestMeeting.plannedStart'))
      .utc()
      .format();
    return meetings
      .filter(meeting => {
        let date = moment(meeting.plannedStart)
          .utc()
          .format();

        if (date > nearestMeetingDate) {
          if (this.page === 0) {
            const found = meetings.find(
              meetingToCheck => meetingToCheck.get('id') === meeting.get('id')
            );
            if (found) {
              found.set('alreadyShown', true);
            }
          }
          if (!meeting.get('isNearest')) {
            return meeting;
          }
        }
      })
      .sortBy('plannedStart');
  }),

  actions: {
    selectAgenda(meeting) {
      this.set('sessionService.selectedAgendaItem', null);
      this.set('sessionService.currentSession', meeting);
      this.transitionToRoute('agenda.agendaitems', meeting.get('id'));
    },
    createNewSession() {
      this.toggleProperty('creatingNewSession');
    },
    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
    },
    successfullyAdded() {
      this.set('creatingNewSession', false);
      this.send('refresh');
    },
    setDateFilter(date) {
      date = date.split('/').join('-');
      const match = this.dateRegex.exec(date);
      if (!match) {
        this.set('from', undefined);
        this.set('to', undefined);
        return;
      }
      const min = moment(parseInt(match[3]), 'YYYY', true);
      let unitToAdd;
      if (match[1] && match[2]) {
        unitToAdd = 'day';
        min.set('date', parseInt(match[1]));
        min.set('month', parseInt(match[2]) - 1); // Count starts from 0
      } else if (match[1]) {
        unitToAdd = 'month';
        min.set('month', parseInt(match[1]) - 1);
      } else {
        unitToAdd = 'year';
      }
      const max = min.clone().add(1, unitToAdd + 's');
      
      this.set('from', min.format('YYYY-MM-DD'));
      this.set('to', max.format('YYYY-MM-DD'));
      this.set('page', undefined);
    }
  }
});
