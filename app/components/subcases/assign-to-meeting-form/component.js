import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
	store: inject(),
  globalError: inject(),
  intl: inject(),

	dateObjectsToEnable: computed(function () {
		const dateOfToday = moment().utc().format();
		return this.store.query('meeting', {
			filter: {
				':gte:planned-start': dateOfToday,
				'is-final': false
			}, 
			sort: 'planned-start' });
  }),

	actions: {
		selectStartDate(val) {
			this.set('startDate', moment(val).format());
    },

		async assignToMeeting(subcase) {
			const { startDate, dateObjectsToEnable } = this;
			const meetings = dateObjectsToEnable;

      // Using format('L') (DD/MM/YYYY) to only compare the dates since the startDate time will always be 0:00
      const meetingToAssignTo = meetings.find(meeting => 
        moment(meeting.get('plannedStart')).utc().format('L') == moment(startDate).format('L'));
			const selectedSubcase = await this.store.findRecord('subcase', subcase.get('id'));
			if (selectedSubcase && meetingToAssignTo) {
        // Closing modal happens first because a user is able to click assign button multiple times during proposing
				this.closeModal();
				await this.proposeForAgenda(selectedSubcase, meetingToAssignTo);
			}else {
				this.globalError.showToast.perform(
					EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error'),
            type: 'error',
					})
        );
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
