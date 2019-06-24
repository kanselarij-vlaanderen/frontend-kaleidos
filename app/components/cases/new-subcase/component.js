import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import ApprovalsEditMixin from 'fe-redpencil/mixins/approvals-edit-mixin';
import moment from 'moment';

export default Component.extend(ApprovalsEditMixin, {
	store: inject(),
	classNames: ["vl-custom"],
	confidentiality: null,

	title: computed('case', function () {
		return this.get('case.title');
	}),

	shortTitle: computed('case', function () {
		return this.get('case.shortTitle');
	}),

	confidential: computed('case', function () {
		return this.get('case.confidential');
	}),

	didInsertElement() {
		this._super(...arguments);
		this.set('showAsRemark', false);
		this.set('item', null);
	},

	async copySubcaseProperties(subcase, latestSubcase) {
		const mandatees = await latestSubcase.get('mandatees');
		const iseCodes = await latestSubcase.get('iseCodes');
		const themes = await latestSubcase.get('themes');

		subcase.set('mandatees', mandatees);
		subcase.set('iseCodes', iseCodes);
		subcase.set('themes', themes);

		return subcase.save();
	},

	async copyNewsletterInfo(subcase, newsletterInfo) {
		const newsletterInfoToCreate = this.store.createRecord('newsletter-info', {
			subcase,
			text: newsletterInfo.get('text'),
			subtitle: newsletterInfo.get('subtitle'),
			title: newsletterInfo.get('title'),
			richtext: newsletterInfo.get('richtext'),
			finished: false,
			publicationDate: newsletterInfo.get('publicationDate'),
			publicationDocDate: newsletterInfo.get('publicationDocDate'),
		})
		return newsletterInfoToCreate.save();
	},

	async copyDecisions(subcase, decisions) {
		return Promise.all(decisions.map((decision) => {
			const newDecision = this.store.createRecord('decision',
				{
					title: decision.get('title'),
					shortTitle: decision.get('shortTitle'),
					approved: false,
					description: decision.get('description'),
					subcase
				});
			return newDecision.save();
		}))
	},

	createSubcaseObject(newCase, newDate) {
		const { type, title, shortTitle, confidential, showAsRemark } = this;
		return this.store.createRecord('subcase', {
			type, shortTitle, title, confidential, showAsRemark,
			case: newCase,
			created: newDate,
			modified: newDate,
			isArchived: false,
			phases: [],
			formallyOk: false,
		})
	},

	actions: {
		closeModal() {
			this.closeModal();
		},

		async createSubCase(event) {
			event.preventDefault();
			this.set('isLoading', true);
			const caze = await this.store.findRecord('case', this.case.id);
			const latestSubcase = await caze.get('latestSubcase');
			const date = moment().utc().toDate();
			let subcase = await this.createSubcaseObject(caze, date);
			const subcaseName = await caze.getNameForNextSubcase((await this.get('type')));
			subcase.set('subcaseName', subcaseName);
			if (latestSubcase) {
				subcase = await this.copySubcaseProperties(subcase, latestSubcase);
				await this.copyDecisions(subcase, await latestSubcase.get('decisions'));
				const newsletterInfo = await latestSubcase.get('newsletterInfo')
				if (newsletterInfo) {
					await this.copyNewsletterInfo(subcase, newsletterInfo);
				}
			} else {
				subcase = await subcase.save();
			}

			this.set('item', subcase);
			await this.checkForActionChanges();
			this.set('isLoading', false);
			caze.notifyPropertyChange('subcases');
			this.refresh();
		},

		selectPhase(phase) {
			this.set('phase', phase);
		},

		selectType(type) {
			this.set('type', type);
		}
	},
})
