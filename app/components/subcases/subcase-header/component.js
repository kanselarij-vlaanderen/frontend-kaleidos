import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
	store: inject(),
	agendaService: inject(),
	classNames: ["vlc-page-header"],
	isAssigningToAgenda: false,
	isShowingOptions: false,

	meetings: computed('store', function () {
		const dateOfToday = moment().format();
		const dateInTwoWeeks = moment().add(6, 'weeks').format();

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

		async proposeForAgenda(subcase, meeting) {
			subcase.set('requestedForMeeting', meeting);
			const designAgenda = await meeting.get('latestAgenda');
			if (designAgenda.get('name') === "Ontwerpagenda") {
				await this.get('agendaService').createNewAgendaItem(designAgenda, subcase);
				await this.updateModifiedProperty(designAgenda);
			}
			subcase.save().then(subcase => {
				this.assignSubcasePhase(subcase);
			});
		},
		proposeForOtherAgenda(subcase) {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', subcase);
		},

		async unPropose(subcase) {
			const phases = await subcase.get('phases');

			await Promise.all(phases.filter(async phase => {
				const code = await phase.get('code');
				if (!code || code.get('label') == "Ingediend voor agendering") {
					await phase.destroyRecord();
				} else {
					return phase;
				}
			}))
			// const meeting = await subcase.get('requestedForMeeting');
			// const latestAgenda = await meeting.get('latestAgenda');
			// const agendaitems = await latestAgenda.get('agendaitems');

			// const agendaitems = await subcase.get('agendaitems');
			subcase.set('requestedForMeeting', null);

			subcase.save();
		},
		cancel() {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', null);
		},

		async archiveSubcase(subcase) {
			const agendaitems = await subcase.get('agendaitems');
			if (!agendaitems) {
				subcase.set('isArchived', true);
				subcase.save();
			}
			this.set('isArchivingSubcase', false);
		},
		unarchiveSubcase(subcase) {
			subcase.set('isArchived', false);
			subcase.save();
		},
		closeSubcase(subcase) {
			const concluded = subcase.get('concluded');
			subcase.set('concluded', !concluded);
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
