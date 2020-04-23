import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import moment from 'moment';

export default class AgendaitenMinutes extends Component {
  @service store;
  @service sessionService;
  @service currentSession;

  classNames = ['vlc-padding-bottom--large'];
  isEditing = false;

  @alias('sessionService.currentSession') currentSession;

  @action
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
  }

  @action
  async saveChanges(meetingRecord) {
    const recordToSave = this.store.peekRecord('meeting-record', meetingRecord.get('id'));
    await recordToSave.save();
    this.toggleProperty('isEditing');
  }
}
