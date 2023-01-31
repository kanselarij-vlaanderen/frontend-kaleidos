import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { action } from '@ember/object';

/**
 * @argument meeting
 * @argument onProposeForMeeting
 * @argument onCancel
 */
export default class ProposableMeetings extends Component {
  @service store;

  @tracked meetings;
  @tracked meetingsForSelectedDate;
  @tracked datesToEnable;

  constructor() {
    super(...arguments);
    this.loadMeetings.perform();
  }

  @task
  *loadMeetings() {
    const queryParams = {
      filter: {
        ':has-no:agenda': true
      },
      // high page size is mainly for testing, results will be < 5 in normal situations
      page: {
        size: PAGE_SIZE.MEETINGS,
      },
      sort: 'planned-start',
      include: 'kind',
    };
    this.meetings = yield this.store.query('meeting', queryParams);
    this.datesToEnable = this.meetings.map((meeting) => meeting.plannedStart);
  }

  @action
  selectPlannedStart(selectedDate) {
    this.meetingsForSelectedDate = this.meetings.filter((meeting) => meeting.plannedStart.toDateString() === selectedDate.toDateString());
  }

  @action
  proposeForMeeting(meeting) {
    this.args.onProposeForMeeting(meeting);
  }

}
