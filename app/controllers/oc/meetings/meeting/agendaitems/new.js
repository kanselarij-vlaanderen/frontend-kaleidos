import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';
import { A } from '@ember/array';
import { debounce } from '@ember/runloop';

export default Controller.extend(ModelSelectorMixin, {
	store: service(),
	globalError: service(),
	parentController: controller('oc.meetings.meeting.agendaitems'),
	
	meeting: alias('model.meeting'),
	case: null,
	governmentBodies: null,
	
	caseIdentifier: null,
	caseIdentifierRegex: /^\d{4}[A-Z]\d{5}\.\d{3}$/,
	isLoading: false,
	caseIdentifierChanged: observer('caseIdentifier', function() {
		debounce(this, this.updateCase, 500);
	}),
	
	validateCaseIdentifier(identifier) {
		return this.get('caseIdentifierRegex').test(identifier);
	},
	
	fetchCase(identifier) {
		return this.store.query('oc-case', {
			filter: {
				':exact:identifier': identifier
			}
		}).then(cases => {
			return cases.firstObject;
		});
	},
	
	createCase(identifier) {
		return this.store.createRecord('oc-case', {identifier: identifier});
	},
	
	updateCase() {
		let identifier = this.get('caseIdentifier');
		if (this.validateCaseIdentifier(identifier)) {
			let currentCase = this.get('case');
			return this.fetchCase(identifier).then((existingCase) => {
				if (existingCase) {
					if (currentCase && currentCase.get('isNew')) {
						currentCase.rollbackAttributes();
					}
					return this.set('case', existingCase);
				} else {
					if (currentCase && currentCase.get('isNew')) {
						currentCase.set('identifier', identifier);
						return currentCase;
					} else {
						return this.set('case', this.createCase(identifier));
					}
				}
			}).catch((error) => {
				this.globalError.handleError(error);
			});
		} else {
			return this.set('case', null);
		}
	},
	
	saveCase() {
		if (this.get('case.identifier')) {
			this.set('model.case', this.get('case'));
			if (this.get('case.isNew')) {
				return this.get('case').save();
			} else {
				return Promise.resolve(this.get('case'));
			}
		} else {
			return Promise.resolve(this.get('case'));
		}
	},
	
	actions: {
	
		save() {
			this.set('isLoading', true);
			this.saveCase().finally(() => {
				this.get('model').save().then(() => {
					this.parentController.send('updateModel');
					this.transitionToRoute('oc.meetings.meeting.agendaitems');
				}).catch((error) => {
					this.set('isLoading', false);
					this.globalError.handleError(error);
				});
			})
		},
	
		cancel() {
			if (this.get('case.isNew') || this.get('case.hasDirtyAttributes')) {
				this.get('case').rollbackAttributes();
			}
			this.get('model').rollbackAttributes();
			this.transitionToRoute('oc.meetings.meeting.agendaitems');
		},

		updateGovernmentBodies(governmentBodies) {
			this.set('model.submitters', governmentBodies);
		},

		uploadedFile(file) {
			this.set('model.documents', A([file]));
		}
	
	}
});
