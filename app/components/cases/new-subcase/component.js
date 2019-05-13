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

		closeModal() {
			this.closeModal();
		},

		async createSubCase(event) {
			event.preventDefault();
			const caze = await this.store.peekRecord('case', this.case.id);
			const { title, shortTitle, showAsRemark, type } = this;
			const date = new Date();
			const subcase = this.store.createRecord('subcase',
				{
					title: title,
					shortTitle: shortTitle,
					formallyOk: false,
					showAsRemark: showAsRemark,
					case: caze,
					type: type,
					created: date,
					modified: date
				});

			const name = await caze.getNameForNextSubcase(subcase, type);
			subcase.set('subcaseName', name);

			let phase = await this.get('phase');
			if (phase) {
				const subcasePhase = this.store.createRecord('subcase-phase',
					{
						date: new Date(),
						code: phase
					});
				const createdSubphase = await subcasePhase.save();
				subcase.set('phases', [createdSubphase]);
			}

			const newSubcase = await subcase.save();
			await this.uploadFiles(newSubcase);

			this.closeModal();
		},

		selectPhase(phase) {
			this.set('phase', phase);
		},

		selectType(type) {
			this.set('type', type);
		}
	},
})
