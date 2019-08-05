import Component from '@ember/component';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend({
  store: inject(),
  agendaService: inject(),
  globalError: inject(),

  createAgenda(meeting, date) {
    const fallBackDate = moment()
      .utc()
      .toDate();
    const agenda = this.store.createRecord('agenda', {
      name: 'Ontwerpagenda',
      createdFor: meeting,
      created: date || fallBackDate,
      modified: date || fallBackDate
    });

    return agenda.save();
  },

  createAgendaItemToApproveMinutes(agenda, closestMeeting) {
    if (!closestMeeting) {
      return;
    }
    const fallBackDate = moment()
      .utc()
      .toDate();

    const agendaitem = this.store.createRecord('agendaitem', {
      retracted: false,
      postPoned: null,
      created: fallBackDate,
      agenda: agenda,
      priority: 1,
      title: `${closestMeeting.meeting_id}/${closestMeeting.agenda_id}`,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      )
        .utc()
        .format('dddd DD-MM-YYYY')}.`,
      formallyOk: CONFIG.notYetFormallyOk,
      mandatees: [],
      documentVersions: [],
      themes: [],
      approvals: []
    });
    return agendaitem.save();
  },

  actions: {
    async createNewSession() {
      this.set('isLoading', true);
      const date = moment()
        .utc()
        .toDate();
      const startDate = this.get('startDate') || date;
      const newMeeting = this.store.createRecord('meeting', {
        plannedStart: startDate,
        created: date
      });
      const closestMeeting = await this.agendaService.getClosestMeetingAndAgendaId(startDate);

      newMeeting
        .save()
        .then(async meeting => {
          const agenda = await this.createAgenda(meeting, date);
          await this.createAgendaItemToApproveMinutes(agenda, closestMeeting);
          try {
            await this.agendaService.assignNewSessionNumbers();
          } catch (error) {
            this.globalError.handleError(error);
          }
        })
        .catch(error => {
          this.globalError.handleError(error);
        })
        .finally(() => {
          this.set('isLoading', false);
          this.successfullyAdded();
        });
    },

    async selectStartDate(val) {
      this.set(
        'startDate',
        moment(val)
          .utc()
          .toDate()
      );
    },

    cancelForm(event) {
      this.cancelForm(event);
    },

    successfullyAdded() {
      this.successfullyAdded();
    }
  }
});
