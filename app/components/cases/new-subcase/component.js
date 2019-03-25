import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';
import { notifyPropertyChange } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	uploadedFiles: [],
	nonDigitalDocuments: [],
	selectedMandatees: [],
	themes: [],
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
		this.set('title', null);
		this.set('shortTitle', null);
		this.set('isAddingNonDigitalDocument', false);
		this.set('showAsRemark', false);
		this.set('step', 1);
	},

	actions: {
		previousStep() {
			this.decrementProperty('step');
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
			if (!phase) {
				phase = [];
			} else {
				phase = [phase];
			}

			const { title, shortTitle, selectedDomains, selectedMandatees, themes, showAsRemark } = this;
			const subcase = this.store.createRecord('subcase',
				{
					title: title,
					phases: phase,
					shortTitle: shortTitle,
					showAsRemark: showAsRemark,
					governmentDomains: selectedDomains,
					case: caze,
					created: new Date(),
					mandatees: selectedMandatees,
					themes: themes
				});

			const createdSubCase = await subcase.save();
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

			this.clearProperties();
			this.closeModal();
		},

		chooseType(type) {
			this.set('selectedType', type);
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
			uploadedFile.set('public', false);
			this.get('uploadedFiles').pushObject(uploadedFile);
		},

		chooseDocumentType(uploadedFile, type) {
			uploadedFile.set('documentType', type.name || type.description);
		},

		removeFile(file) {
			$.ajax({
				method: "DELETE",
				url: '/files/' + file.id
			})
			this.get('uploadedFiles').removeObject(file);
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
			documentType: file.get('documentType')
		});
		document.save().then(async (createdDocument) => {
			if (file) {
				delete file.public;
				const documentVersion = await this.store.createRecord('document-version', {
					document: createdDocument,
					subcase: subcase,
					created: new Date(),
					versionNumber: 1,
					file: file,
					chosenFileName: file.get('name')
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

	parseDomainsAndMandatees() {
		const mandateeRows = this.get('mandateeRows');
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
	
	async didInsertElement() {
		this._super(...arguments);
		this.set('phases', this.store.findAll('subcase-phase'));
	}
})
