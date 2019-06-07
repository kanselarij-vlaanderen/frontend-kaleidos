
import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	intl: inject(),

	actions: {
		close() {
			this.closeModal();
		}
	}
});
