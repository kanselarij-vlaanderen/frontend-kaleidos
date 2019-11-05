import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-spacer-extended-l'],
  isEditing: false,
  store: inject(),

  allowEditing: computed('definite', function () {
    return this.definite === 'false';
  }),

  async createMeetingRecord() {

  },

  actions: {
    async toggleIsEditing() {
      const meetingNotes = await this.get('currentSession.notes');
      if (!meetingNotes) {
        const date = moment().utc().toDate()
        const meetingRecord = this.store.createRecord('meeting-record',
          {
            created: date,
            modified: date,
            meeting: await this.get('currentSession')
          });
        await meetingRecord.save();
      }
      this.toggleProperty('isEditing')
    },

    async toggleIsEditingMeetingRecord(agendaitem) {
      const notes = await agendaitem.get('meetingRecord');
      if (!notes) {
        const date = moment().utc().toDate()
        const meetingRecord = this.store.createRecord('meeting-record',
          {
            created: date,
            modified: date,
            agendaitem: agendaitem
          });
        await meetingRecord.save();
      }
      agendaitem.set('isEditing', true);

    }
  }
});
