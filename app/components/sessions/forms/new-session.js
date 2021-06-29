import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';
import { isAnnexMeetingKind } from 'frontend-kaleidos/utils/meeting-utils';
import moment from 'moment';
import { A } from '@ember/array';

export default Component.extend({
  store: service(),
  agendaService: service(),
  newsletterService: service(),
  toaster: service(),
  formatter: service(),
  kind: null,
  selectedMainMeeting: null,
  selectedKindUri: null,
  meetingNumber: null,
  isEditingFormattedMeetingIdentifier: false,
  formattedMeetingIdentifier: null,
  currentYear: new Date().getFullYear(),
  meetingNumberPrefix: null,

  init() {
    this._super(...arguments);
    this.generateNewNumber();
  },

  generateNewNumber() {
    // TODO: Improve samen met Michael of Sven
    this.store.query('meeting',
      {
        sort: '-planned-start',
      }).then((meetings) => {
      if (meetings.length) {
        const meetingsFromThisYear = meetings.filter((meeting) => meeting.plannedStart && meeting.plannedStart.getFullYear() === this.currentYear);
        const meetingIds = meetingsFromThisYear.map((meeting) => meeting.number);
        let id = 0;
        // FIX voor de eerste agenda van het jaar -> Anders math.max infinity
        if (meetingIds.length !== 0) {
          id = Math.max(...meetingIds);
        }
        this.set('meetingNumber', id + 1);
        this.set('formattedMeetingIdentifier', `VR PV ${this.currentYear}/${this.meetingNumber}`);
      }
    });
  },

  isAnnexMeeting: computed('selectedKindUri', function() {
    return isAnnexMeetingKind(this.selectedKindUri);
  }),

  async createAgenda(meeting, date) {
    const status = await this.store.findRecordByUri('agendastatus', CONSTANTS.AGENDA_STATUSSES.DESIGN);
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

  // new meeting parameter prevents extra request of agenda.createdFor
  async createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting) {
    const now = new Date();

    // load code-list item
    const decisionResultCode = await this.store.queryOne('decision-result-code', {
      'filter[:uri:]': CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD,
    });

    // Treatment of agenda-item / decision activity
    const startDate = newMeeting.plannedStart;
    const agendaItemTreatment = this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      startDate: startDate,
      decisionResultCode,
    });
    await agendaItemTreatment.save();

    const agendaitem = this.store.createRecord('agendaitem', {
      created: now,
      agenda,
      priority: 1,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      ).format('dddd DD-MM-YYYY')}.`,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      mandatees: [],
      pieces: [],
      approvals: [],
      isApproval: true,
      treatments: A([agendaItemTreatment]),
    });
    return await agendaitem.save();
  },

  actions: {
    async createNewSession() {
      const {
        isDigital, extraInfo, selectedKindUri, meetingNumber, formattedMeetingIdentifier,
      } = this;
      this.set('isLoading', true);
      const kindUriToAdd = selectedKindUri || CONFIG.MINISTERRAAD_TYPES.DEFAULT;
      const date = this.formatter.formatDate(null);
      const startDate = this.get('startDate') || date;
      const newMeeting = this.store.createRecord('meeting', {
        isDigital,
        extraInfo,
        plannedStart: startDate,
        created: date,
        kind: kindUriToAdd,
        mainMeeting: this.selectedMainMeeting,
        number: meetingNumber,
        numberRepresentation: formattedMeetingIdentifier,
      });

      const closestMeeting = await this.agendaService.getClosestMeetingAndAgendaId(startDate);

      try {
        await newMeeting.save();
        const agenda = await this.createAgenda(newMeeting, date);
        if (!newMeeting.isAnnex && closestMeeting) {
          await this.createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting);
        }
        await this.newsletterService.createNewsItemForMeeting(newMeeting);
        // TODO: Should fix sessionNrBug
        // await this.agendaService.assignNewSessionNumbers();
      } catch (err) { // eslint-disable-line no-unused-vars
        this.toaster.error();
      } finally {
        this.set('isLoading', false);
        this.successfullyAdded(newMeeting);
      }
    },

    selectMainMeeting(mainMeeting) {
      const kind = CONFIG.MINISTERRAAD_TYPES.TYPES.find((minsterraad) => minsterraad.uri === this.selectedKindUri);
      const postfix = (kind && kind.postfix) || '';
      this.set('selectedMainMeeting', mainMeeting);
      this.set('startDate', mainMeeting.plannedStart);
      this.set('meetingNumber', mainMeeting.number);
      this.set('formattedMeetingIdentifier', `${mainMeeting.numberRepresentation}-${postfix}`);
      this.set('extraInfo', mainMeeting.extraInfo);
    },

    selectStartDate(val) {
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
      if (!this.isAnnexMeeting) {
        this.set('selectedMainMeeting', null);
        this.generateNewNumber();
      }
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
