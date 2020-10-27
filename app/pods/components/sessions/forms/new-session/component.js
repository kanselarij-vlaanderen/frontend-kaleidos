import Component from '@ember/component';
import { inject as service } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend({
  store: service(),
  agendaService: service(),
  newsletterService: service(),
  toaster: service(),
  formatter: service(),
  kind: null,
  selectedKindUri: null,
  meetingNumber: null,
  isEditingFormattedMeetingIdentifier: false,
  formattedMeetingIdentifier: null,
  currentYear: moment().year(),
  meetingNumberPrefix: null,

  init() {
    this._super(...arguments);
    // TODO: Improve samen met Michael of Sven
    this.store.query('meeting',
      {
        sort: '-planned-start',
      }).then((meetings) => {
      let meetingsFromThisYear = null;
      if (meetings.length) {
        meetingsFromThisYear = meetings.map((meeting) => {
          if (moment(meeting.plannedStart).year() === this.currentYear) {
            return meeting;
          }
        }).filter((meeting) => meeting); // Filter undefineds out of results..

        let id = 0;
        meetingsFromThisYear.forEach((meeting) => {
          const number = meeting.get('number');
          if (number > id) {
            id = number;
          }
        });
        this.set('meetingNumber', id + 1);
        this.set('formattedMeetingIdentifier', `VR PV ${this.currentYear}/${this.meetingNumber}`);
      }
    });
  },

  async createAgenda(meeting, date) {
    const status = await this.store.findRecord('agendastatus', CONFIG.agendaStatusDesignAgenda.id);
    const fallBackDate = this.formatter.formatDate(null);
    const agenda = this.store.createRecord('agenda', {
      serialnumber: 'A',
      title: `Agenda A voor zitting ${moment(meeting.plannedStart).format('D-M-YYYY')}`,
      createdFor: meeting,
      status,
      created: date || fallBackDate,
      modified: date || fallBackDate,
    });
    const savedAgenda = await agenda.save();
    return savedAgenda;
  },

  async createAgendaitemToApproveMinutes(agenda, closestMeeting) {
    if (!closestMeeting) {
      return null;
    }
    const fallBackDate = this.formatter.formatDate(null);
    const agendaitem = this.store.createRecord('agendaitem', {
      created: fallBackDate,
      agenda,
      priority: 1,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      ).format('dddd DD-MM-YYYY')}.`,
      formallyOk: CONFIG.notYetFormallyOk,
      mandatees: [],
      pieces: [],
      approvals: [],
      isApproval: true,
    });
    return await agendaitem.save();
  },

  actions: {
    async createNewSession() {
      const {
        isDigital, extraInfo, selectedKindUri, meetingNumber, formattedMeetingIdentifier,
      } = this;
      this.set('isLoading', true);
      const kindUriToAdd = selectedKindUri || CONFIG.defaultKindUri;
      const date = this.formatter.formatDate(null);
      const startDate = this.get('startDate') || date;
      const newMeeting = this.store.createRecord('meeting', {
        isDigital,
        extraInfo,
        plannedStart: startDate,
        created: date,
        kind: kindUriToAdd,
        number: meetingNumber,
        numberRepresentation: formattedMeetingIdentifier,
      });
      const closestMeeting = await this.agendaService.getClosestMeetingAndAgendaId(startDate);

      newMeeting
        .save()
        .then(async(meeting) => {
          const agenda = await this.createAgenda(meeting, date);
          await this.createAgendaitemToApproveMinutes(agenda, closestMeeting);
          await this.newsletterService.createNewsItemForMeeting(meeting);

          // TODO: Should fix sessionNrBug
          // await this.agendaService.assignNewSessionNumbers();
        })
        .catch(() => {
          this.toaster.error();
        })
        .finally(() => {
          this.set('isLoading', false);
          this.successfullyAdded();
        });
    },

    async selectStartDate(val) {
      this.set('startDate', this.formatter.formatDate(val));
    },

    cancelForm(event) {
      this.cancelForm(event);
    },

    successfullyAdded() {
      this.successfullyAdded();
    },

    setKind(kind) {
      this.set('selectedKindUri', kind);
    },

    meetingNumberChangedAction(meetingNumber) {
      this.set('meetingNumber', meetingNumber);
      this.set('formattedMeetingIdentifier', `VR PV ${this.currentYear}/${meetingNumber}`);
    },

    editFormattedMeetingIdentifier() {
      this.set('isEditingFormattedMeetingIdentifier', true);
    },

    saveAction() {
      this.set('formattedMeetingIdentifier', `${this.get('formattedMeetingIdentifier')}`);
      this.set('isEditingFormattedMeetingIdentifier', false);
    },
  },
});
