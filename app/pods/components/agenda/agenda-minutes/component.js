import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, computed
} from '@ember/object';
import moment from 'moment';

export default class AgendaMinutes extends Component {
  @service store;

  @service currentSession;

  classNames = ['vl-u-spacer-extended-l'];

  isEditing = false;

  @computed('definite')
  get allowEditing() {
    return this.definite === 'false';
  }

  @action
  async toggleIsEditing() {
    const meetingNotes = await this.get('currentSession.notes');
    if (!meetingNotes) {
      const date = moment().utc()
        .toDate();
      const meetingRecord = this.store.createRecord('meeting-record',
        {
          created: date,
          modified: date,
          meeting: await this.get('currentSession'),
        });
      await meetingRecord.save();
    }
    this.toggleProperty('isEditing');
  }

  @action
  async toggleIsEditingMeetingRecord(agendaitem) {
    const notes = await agendaitem.get('meetingRecord');
    if (!notes) {
      const date = moment().utc()
        .toDate();
      const meetingRecord = this.store.createRecord('meeting-record',
        {
          created: date,
          modified: date,
          agendaitem,
        });
      await meetingRecord.save();
    }
    agendaitem.set('isEditing', true);
  }
}
