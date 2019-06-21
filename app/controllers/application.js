import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import EmberObject from '@ember/object';

export default Controller.extend(isAuthenticatedMixin, {
	currentSession: inject(),
	session: inject(),
	router: inject(),
	globalError: inject(),
	messages: alias('globalError.messages'),

	init() {
		this._super(...arguments);
		this.globalError.showToast.perform(EmberObject.create({ title: "lol", message: "lolly" }));

	},

	shouldNavigateObserver: on('init', observer('router.currentRouteName', 'currentSession.userRole', async function () {
		const router = this.get('router');
		const role = await this.get('currentSession.userRole');
		const user = await this.get('session.isAuthenticated');
		if (router && user && role == "no-access") {
			this.transitionToRoute('accountless-users');
		}
	})),

	type: computed('model', async function () {
		const { model } = this;
		if (model) {
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
		},

		closeErrorMessage() {
			this.set('globalError.messages', null);
		}
	}
});
