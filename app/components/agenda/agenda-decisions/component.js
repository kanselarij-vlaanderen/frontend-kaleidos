
import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Component.extend({
	intl: inject(),

	title: computed('currentSession', function() {
		const date = this.get('currentSession.plannedStart');
		return `${this.get('intl').t('press-agenda')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		close() {
			this.closeModal();
		}
	}
});
