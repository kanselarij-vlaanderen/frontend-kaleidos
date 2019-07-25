import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';
import { A } from '@ember/array';

import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Controller.extend(ModelSelectorMixin, {
	store: service(),
	globalError: service(),
	parentController: controller('oc.meetings.meeting.agendaitems'),
	
	meeting: alias('model.meeting'),
	case: alias('model.case'),
	governmentBodies: null,
	
	caseIdentifier: null,
	isLoading: false, 
	
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
	
	updateCase(identifier) {
		let currentCase = this.get('case');
		return this.fetchCase(identifier).then((existingCase) => {
			if (existingCase) {
				if (currentCase && currentCase.get('isNew')) {
					currentCase.rollbackAttributes();
				}
				return this.set('case', existingCase);
			} else {
				if (currentCase && currentCase.isNew) {
					currentCase.set('identifier', identifier);
					return currentCase;
				} else {
					return this.set('case', this.createCase(identifier));
				}
			}
		}).catch((error) => {
			this.globalError.handleError(error);
		});
	},
	
	actions: {
	
		save() {
			this.set('isLoading', true);
			this.updateCase(this.get('caseIdentifier')).then((_case) => {
				_case.save().then(() => {
					this.get('model').save().then(() => {
						this.parentController.send('updateModel');
						this.transitionToRoute('oc.meetings.meeting.agendaitems');
					}).catch((error) => {
						this.set('isLoading', false);
						this.globalError.handleError(error);
					});
				})
			})
		},
	
		cancel() {
			if (this.get('case')) {
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
