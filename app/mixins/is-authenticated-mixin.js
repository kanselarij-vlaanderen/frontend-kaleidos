import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Mixin.create({
	currentAuthenticatedSession: inject('current-session'),
	store:inject(),
	isAdmin: alias('currentAuthenticatedSession.isAdmin'),
	user: alias('currentAuthenticatedSession.userContent'),
	role: alias('currentAuthenticatedSession.userRole'),

	actions: {
		logoutUser() {
			this.currentAuthenticatedSession.logout();
		}
	}
});
