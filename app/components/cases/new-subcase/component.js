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
	step: 1,

	title: computed('model', function () {
		return this.get('model').shortTitle;
	}),

	clearProperties() {
		this.set('uploadedFiles', []);
		this.set('nonDigitalDocuments', []);
		this.set('selectedMandatees', []);
		this.set('title', undefined);
		this.set('shortTitle', undefined);
		this.set('isAddingNonDigitalDocument', false);
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
			const caze = this.store.peekRecord('case', this.model.id);
			const subcase = this.store.createRecord('subcase',
				{
					title: this.get('title'),
					shortTitle: this.get('shortTitle'),
					showAsRemark: false,
					governmentDomains: this.get('selectedDomains'),
					case: caze,
					created: new Date(),
					mandatees: this.get('selectedMandatees'),
					themes: this.get('themes')
				});

			const createdSubCase = await subcase.save();
			const uploadedFiles = this.get('uploadedFiles');
			if(uploadedFiles) {
				Promise.all(uploadedFiles.map(uploadedFile => {
					if (uploadedFile.id) {
						return this.createNewDocumentWithDocumentVersion(createdSubCase, uploadedFile, uploadedFile.get('name'));
					}
				}));
			}

			const nonDigitalDocuments = this.get('nonDigitalDocuments');
			if(nonDigitalDocuments) {
				Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
					if (nonDigitalDocument.title) {
						return this.createNewDocumentWithDocumentVersion(createdSubCase, null, nonDigitalDocument.title);
					}
				}));
			}
			
			this.clearProperties();
			this.closeModal();
		},

		chooseType(type) {
			this.set('selectedType', type);
		},

		chooseTheme(themes) {
			this.set('themes', themes);
		},

		selectMandatees(mandatees) {
			this.set('selectedMandatees', mandatees);
		},

		uploadedFile(uploadedFile) {
			uploadedFile.set('public', true);
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
			this.nonDigitalDocuments.push({ title: this.get('documentTitle') });
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
			title: documentTitle
			// documentType: file.get('documentType')
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
		if(mandateeRows && mandateeRows.get('length') > 0) {
			mandateeRows.map(row => {
				mandatees.push(row.get('mandatee'));
				const domains = row.get('selectedDomains')
				domains.map(domain => {
					selectedDomains.push(domain);
				})
			})
		}
		this.set('selectedMandatees', mandatees);
		this.set('selectedDomains', selectedDomains);
		
	}
})
