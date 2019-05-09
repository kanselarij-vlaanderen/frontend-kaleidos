import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ['vlc-navbar', 'vlc-navbar--bordered-bottom', 'vlc-navbar--no-padding', 'vlc-navbar--bg-alt', 'vlc-navbar--auto', 'c-main-nav'],
	elementId: 'c-main-nav',

	actions: {
		navigateToMockLogin() {
			// this.currentAuthenticatedSession.logout()
			// this.navigateToMockLogin();
		}
	}
});
