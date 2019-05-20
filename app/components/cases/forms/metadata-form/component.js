import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

const levels = {
  oc: "6f771654-a8be-43e6-9fe5-7e17fed1cb9a"
};

export default Component.extend({
  store: inject(),

  dateObjectsToEnable: computed('store', function () {
    return this.store.query('meeting', {});
  }),

  isOC: computed('selectedPolicyLevel.id', function () {
    const { selectedPolicyLevel } = this;
    if (selectedPolicyLevel) {
      return levels.oc === selectedPolicyLevel.get('id');
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

      const meetingToAssignTo = meetings.find(meeting =>
        moment(meeting.get('plannedStart')).format() == moment(date).format());
      console.log(meetingToAssignTo);
    }
  }
});
