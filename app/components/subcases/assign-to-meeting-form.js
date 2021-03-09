import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Component.extend({
  store: service(),
  toaster: service(),
  intl: service(),

  dateObjectsToEnable: computed(function() {
    const dateOfToday = moment().utc()
      .subtract(1, 'weeks')
      .format();
    return this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
        'is-final': false,
      },
      sort: 'planned-start',
    });
  }),

  actions: {
    selectStartDate(val) {
      this.set('startDate', moment(val).format());
    },

    async assignToMeeting(subcase) {
      const {
        startDate, dateObjectsToEnable,
      } = this;
      const meetings = dateObjectsToEnable;

      // Using format('L') (DD/MM/YYYY) to only compare the dates since the startDate time will always be 0:00
      const meetingToAssignTo = meetings.find((meeting) => moment(meeting.get('plannedStart')).utc()
        .format('L') === moment(startDate).format('L'));
      const selectedSubcase = await this.store.findRecord('subcase', subcase.get('id'));
      if (selectedSubcase && meetingToAssignTo) {
        // Closing modal happens first because a user is able to click assign button multiple times during proposing
        this.closeModal();
        await this.proposeForAgenda(selectedSubcase, meetingToAssignTo);
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    },

    cancel() {
      this.cancel();
    },
    closeModal() {
      this.cancel();
    },
  },
});
