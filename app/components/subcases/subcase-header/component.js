import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	classNames: ["vlc-page-header"],
	isAssigningToAgenda: false,
  isShowingOptions: false,

	meetings: computed('store', function () {
		const dateOfToday = moment().format();
		const dateInTwoWeeks = moment().add(2, 'weeks').format();

		return this.store.query('meeting', {
			filter: {
				':gte:planned-start': dateOfToday,
				':lte:planned-start': dateInTwoWeeks
			},
			sort: 'planned-start'
		})
	}),

	actions: {
    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },
		proposeForAgenda(subcase, meeting) {
			subcase.set('requestedForMeeting', meeting);
			subcase.save().then(subcase => {
				this.assignSubcasePhase(subcase);
			});
		},
		proposeForOtherAgenda(subcase) {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', subcase);
		},

		async unPropose(subcase) {
			subcase.set('requestedForMeeting', null);
			const phases = await subcase.get('phases');

			await Promise.all(phases.filter(async phase => {
				const code = await phase.get('code');
				if(!code || code.get('label') == "Ingediend voor agendering") {
					await phase.destroyRecord();
				} else {
					return phase;
				}
			}))
			subcase.save();
		},
		cancel() {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', null);
		},

    archiveSubcase(subcase) {
      subcase.set('isArchived', true);
      this.set('isArchivingSubcase', false);
      subcase.save();
    },
    unarchiveSubcase(subcase) {
      subcase.set('isArchived', false);
      subcase.save();
    },
    requestArchiveSubcase() {
      this.set('isArchivingSubcase', true);
    },
    cancelArchiveSubcase() {
      this.set('isArchivingSubcase', false);
    }
	},

	async assignSubcasePhase(subcase) {
		const phasesCodes = await this.store.query('subcase-phase-code', { filter: { label: 'Ingediend voor agendering' } });
		const phaseCode = phasesCodes.get('firstObject');
		if (phaseCode) {
			const phase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: phaseCode,
				subcase: subcase
			});
			phase.save();
		}
	}
});
