import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend({
  store: inject(),

  dateObjectsToEnable: computed('store', function () {
    return this.store.findAll('meeting', {});
  }),

  isOC: computed('selectedPolicyLevel', function () {
    const { selectedPolicyLevel } = this;
    if (selectedPolicyLevel) {
      return CONFIG.OCCaseTypeID === selectedPolicyLevel.get('id');
    }
  }),

  actions: {
    chooseType(type) {
      this.subcaseTypeChanged(type);
    },

    async selectMeeting(date) {
      const meetings = await this.get('dateObjectsToEnable');
      const dateToCheck = moment(date).utc().format();
      const meetingToAssignTo = meetings.find(meeting =>
        moment(meeting.get('plannedStart')).utc().format() == dateToCheck);

      this.selectedMeetingChanged(meetingToAssignTo);
    },

    chooseSubmitter(submitter) {
      this.submitterChanged(submitter);
    }
  }
});
