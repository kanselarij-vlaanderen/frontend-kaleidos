import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  sessionService: inject(),
  classNames: ['vlc-padding-bottom--large'],
  isEditing: false,

  currentSession: alias('sessionService.currentSession'),

  signedDocument: computed('agendaitem.meetingRecord.signedDocument', async function () {
    return await this.get('agendaitem.meetingRecord.signedDocument');
  }),

  actions: {
    async toggleIsEditing() {
      const agendaitemNotes = await this.get('agendaitem.meetingRecord');
      const date = moment().utc().toDate();
      if (!agendaitemNotes) {
        const meetingRecord = this.store.createRecord('meeting-record', {
          created: date,
          modified: date,
          announcements: null,
          others: null,
          description: '',
          attendees: [],
          agendaitem: await this.get('agendaitem'),
          meeting: null
        })
        await meetingRecord.save()
      }
      this.toggleProperty('isEditing');
    },

    async saveChanges(meetingRecord) {
      const recordToSave = this.store.peekRecord('meeting-record', meetingRecord.get('id'));
      await recordToSave.save();
      this.toggleProperty('isEditing');
    }
  }
});
