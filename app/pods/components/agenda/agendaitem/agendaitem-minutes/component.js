import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

import moment from 'moment';

export default Component.extend({
  store: inject(),
  sessionService: inject(),
  currentSessionService: inject('current-session'),
  classNames: ['vlc-padding-bottom--large'],
  isEditing: false,

  currentSession: alias('sessionService.currentSession'),

  signedDocumentContainer: computed('agendaitem.meetingRecord.signedDocumentContainer', async function() {
    return await this.get('agendaitem.meetingRecord.signedDocumentContainer');
  }),

  actions: {
    async toggleIsEditing() {
      const agendaitemNotes = await this.get('agendaitem.meetingRecord');
      const date = moment().utc()
        .toDate();
      if (!agendaitemNotes) {
        const meetingRecord = this.store.createRecord('meeting-record', {
          created: date,
          modified: date,
          announcements: null,
          others: null,
          description: '',
          attendees: [],
          agendaitem: await this.get('agendaitem'),
          meeting: null,
        });
        await meetingRecord.save();
      }
      this.toggleProperty('isEditing');
    },

    async saveChanges(meetingRecord) {
      const recordToSave = this.store.peekRecord('meeting-record', meetingRecord.get('id'));
      await recordToSave.save();
      this.toggleProperty('isEditing');
    },

    async addDocument(document) {
      await document.save();
    },
  },
});
