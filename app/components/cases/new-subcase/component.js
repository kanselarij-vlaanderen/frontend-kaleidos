import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import ApprovalsEditMixin from 'fe-redpencil/mixins/approvals-edit-mixin';

export default Component.extend(ApprovalsEditMixin, {
	store: inject(),
	classNames: ["vl-custom"],
	modelToAddDocumentVersionTo: 'subcase',
	selectedMandatees: null,
	themes: null,
	confidentiality: null,
	isAddingNonDigitalDocument: false,
	showAsRemark: false,
	step: 1,

	title: computed('case', function () {
		return this.get('case').title;
	}),

	shortTitle: computed('case', function () {
		return this.get('case').shortTitle;
	}),

	didInsertElement() {
		this._super(...arguments);
		this.set('showAsRemark', false);
		this.set('item', null);
	},

	async copySubcaseProperties(latestSubcase, caze) {
		const { type, phase } = this;
		const date = new Date();
		const name = await caze.getNameForNextSubcase(latestSubcase, type);
		const subcasePhase = this.store.createRecord('subcase-phase',
			{
				date: date,
				code: phase
			});
		const createdSubphase = await subcasePhase.save();
		const mandatees = await latestSubcase.get('mandatees');
		const iseCodes = await latestSubcase.get('iseCodes');
		const themes = await latestSubcase.get('themes');

		const subcase = this.store.createRecord('subcase',
			{
				concluded: false,
				confidential: latestSubcase.get('confidential'),
				title: latestSubcase.get('title'),
				shortTitle: latestSubcase.get('shortTitle'),
				formallyOk: latestSubcase.get('formallyOk'),
				showAsRemark: latestSubcase.get('showAsRemark'),
				isArchived: latestSubcase.get('isArchived'),
				subcaseName: name,
				case: caze,
				type: type,
				created: date,
				modified: date,
				phases: [createdSubphase],
				iseCodes: iseCodes || [],
				mandatees: mandatees || [],
				themes: themes || []
			});

		return subcase.save()
	},

	actions: {

		closeModal() {
			this.closeModal();
		},

		async createSubCase(event) {
			event.preventDefault();
			const caze = await this.store.peekRecord('case', this.case.id);
			const latestSubcase = await caze.get('latestSubcase');
			const subcase = await this.copySubcaseProperties(latestSubcase, caze);
			this.set('item', subcase);
			const decision = this.store.createRecord('decision',
				{
					title: latestSubcase.get('title'),
					shortTitle: latestSubcase.get('shortTitle'),
					approved: false,
					subcase: subcase
				});
			await decision.save();
			await this.checkForActionChanges();
			this.refresh();
			// this.closeModal();
		},

		selectPhase(phase) {
			this.set('phase', phase);
		},

		selectType(type) {
			this.set('type', type);
		}
	},
})
