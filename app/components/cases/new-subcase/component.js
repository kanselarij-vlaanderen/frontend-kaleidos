import Component from '@ember/component';
import { computed } from '@ember/object';
import { notifyPropertyChange } from '@ember/object';
import { inject } from '@ember/service';


export default Component.extend({
	store: inject(),
	classNames:["vl-custom"],
	uploadedFiles: [],
	nonDigitalDocuments: [],
	selectedMandatees: [],
	themes: [],
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
		this.set('uploadedFiles', []);
		this.set('nonDigitalDocuments', []);
		this.set('selectedMandatees', []);
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
					formallyOk:false,
					showAsRemark: showAsRemark,
					governmentDomains: selectedDomains,
					case: caze,
					created: new Date(),
					mandatees: selectedMandatees,
					themes: themes,
					confidentiality: confidentiality
				});

			const createdSubCase = await subcase.save();
			createdSubphase.set('subcase', createdSubCase);
			createdSubphase.save();

			const uploadedFiles = this.get('uploadedFiles');
			Promise.all(uploadedFiles.map(uploadedFile => {
				if (uploadedFile.id) {
					return this.createNewDocumentWithDocumentVersion(createdSubCase, uploadedFile, uploadedFile.get('name'));
				}
			}));

			const nonDigitalDocuments = this.get('nonDigitalDocuments');
			Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
				if (nonDigitalDocument.title) {
					return this.createNewDocumentWithDocumentVersion(createdSubCase, null, nonDigitalDocument.title);
				}
			}));

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

		uploadedFile(uploadedFile) {
			this.get('uploadedFiles').pushObject(uploadedFile);
		},

		removeDocument(document) {
			this.get('nonDigitalDocuments').removeObject(document);
		},

		createNonDigitalDocument() {
			this.nonDigitalDocuments.push({ title: this.get('documentTitle'), description: this.get('documentDescription') });
			notifyPropertyChange(this, 'nonDigitalDocuments');
			this.set('documentTitle', null);
		},

		toggleAddNonDigitalDocument() {
			this.toggleProperty('isAddingNonDigitalDocument')
		},

		mandateeRowsChanged(mandateeRows) {
			this.set('mandateeRows', mandateeRows);
		}
	},

	async createNewDocumentWithDocumentVersion(subcase, file, documentTitle) {
		let document = await this.store.createRecord('document', {
			created: new Date(),
			title: documentTitle,
			type: file.get('documentType'),
			confidentiality: file.get('confidentiality')
		});
		
		document.save().then(async (createdDocument) => {
			if (file) {
				const documentVersion = await this.store.createRecord('document-version', {
					document: createdDocument,
					subcase: subcase,
					created: new Date(),
					versionNumber: 1,
					file: file,
					chosenFileName: file.get('chosenFileName') 
				});
				await documentVersion.save();
			} else {
				const documentVersion = await this.store.createRecord('document-version', {
					document: createdDocument,
					subcase: subcase,
					created: new Date(),
					versionNumber: 1,
					chosenFileName: documentTitle
				});
				await documentVersion.save();
			}
		});
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
