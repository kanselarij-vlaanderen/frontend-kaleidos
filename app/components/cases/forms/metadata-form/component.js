import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend({
  store: inject(),

  dateObjectsToEnable: computed('store', function () {
    return this.store.query('meeting', {});
  }),

  isOC: computed('selectedPolicyLevel.id', function () {
    const { selectedPolicyLevel } = this;
    if (selectedPolicyLevel) {
      return CONFIG.OCCaseTypeID === selectedPolicyLevel.get('id');
    }
  }),

  actions: {
    typeChanged(type) {
      this.typeChanged(type);
    },

    chooseType(type) {
      this.subcaseTypeChanged(type);
    },

    async selectMeeting(date) {
      const meetings = await this.get('dateObjectsToEnable');
      const dateToCheck = moment(date).format();
      const meetingToAssignTo = meetings.find(meeting =>
        moment(meeting.get('plannedStart')).format() == dateToCheck);

      this.selectedMeetingChanged(meetingToAssignTo);
    },

    chooseSubmitter(submitter) {
      this.submitterChanged(submitter);
    }
  }
});
