import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
	globalError: service(),

	parentController: controller('oc.meetings'),

	isLoading: false, 
	
	actions: {
		save() {
			this.set('isLoading', true);
			this.get('model').save()
				.catch((error) => {
				this.globalError.handleError(error);
			}).finally(() => {
				this.set('isLoading', false);
				this.parentController.send('updateModel');
				this.transitionToRoute('oc.meetings.index');
			});
		},

		cancel() {
      this.get('model').rollbackAttributes();
			this.transitionToRoute('oc.meetings.meeting.agendaitems', this.get('model'));
		},
	}
});
