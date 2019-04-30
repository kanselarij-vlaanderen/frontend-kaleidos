import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';


export default Component.extend(UploadDocumentMixin, {
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

	clearProperties() {
		this.set('uploadedFiles', null);
		this.set('nonDigitalDocuments', null);
		this.set('selectedMandatees', []);
		this.set('themes', []);
		this.set('isAddingNonDigitalDocument', false);
		this.set('showAsRemark', false);
		this.set('step', 1);
	},

	didInsertElement() {
		this._super(...arguments);
		this.clearProperties();
	},

	actions: {
		previousStep() {
			this.decrementProperty('step');
		},

		selectConfidentiality(confidentiality) {
			this.set('confidentiality', confidentiality);
		},

		nextStep() {
			this.incrementProperty('step');
		},

		closeModal() {
			this.closeModal();
		},

		async createSubCase(event) {
			event.preventDefault();
			this.parseDomainsAndMandatees();

			const caze = this.store.peekRecord('case', this.case.id);
			let phase = await this.get('phase');

			const subcasePhase = this.store.createRecord('subcase-phase',
				{
					date: new Date(),
					code: phase
				});

			const createdSubphase = await subcasePhase.save();

			const { title, shortTitle, selectedDomains, selectedMandatees, themes, showAsRemark, confidentiality } = this;
			const subcase = this.store.createRecord('subcase',
				{
					title: title,
					phases: [createdSubphase],
					shortTitle: shortTitle,
					formallyOk: false,
					showAsRemark: showAsRemark,
					governmentDomains: selectedDomains,
					case: caze,
					created: new Date(),
					mandatees: selectedMandatees,
					themes: themes,
					confidentiality: confidentiality
				});

			const newSubcase = await subcase.save();
			await this.uploadFiles(newSubcase);

			this.closeModal();
		},

		selectPhase(phase) {
			this.set('phase', phase);
		},

		chooseTheme(themes) {
			this.set('themes', themes);
		},

		selectMandatees(mandatees) {
			this.set('selectedMandatees', mandatees);
		},

		mandateeRowsChanged(mandateeRows) {
			this.set('mandateeRows', mandateeRows);
		}
	},

	async parseDomainsAndMandatees() {
		const mandateeRows = await this.get('mandateeRows');
		const mandatees = [];
		const selectedDomains = [];
		if (mandateeRows && mandateeRows.get('length') > 0) {
			mandateeRows.map(row => {
				mandatees.push(row.get('mandatee'));
				const domains = row.get('selectedDomains');
				domains.map(domain => {
					selectedDomains.push(domain);
				})
			})
		}
		this.set('selectedMandatees', mandatees);
		this.set('selectedDomains', selectedDomains);
	},

})
