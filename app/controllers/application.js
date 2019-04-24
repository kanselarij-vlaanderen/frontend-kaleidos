import Controller from '@ember/controller';
import { computed,observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
	currentSession: inject(),
	router:inject(),

	shouldNavigateObserver: on('init', observer('router.currentRouteName', 'currentSession.userRole', async function () {
		const router = this.get('router');
    const role = await this.get('currentSession.userRole');
		if (router && !role ) {
			this.transitionToRoute('accountless-users');
		}
  })),
	
	type: computed('model', async function() {
		const { model } = this;
		if(model) {
			const type = await model.get('type.label');
			if (type === 'Waarschuwing') {
				return 'vl-alert--warning';
			} else if (type === 'Dringend') {
				return 'vl-alert--error';
			}
		}
		return '';
	}),

	actions: {
		close() {
			this.set('model', null);
		},

		navigateToMockLogin() {
			this.transitionToRoute('mock-login');
		}
	}
});
