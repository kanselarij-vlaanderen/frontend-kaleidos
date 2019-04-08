import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
	intl: inject(),

	title: computed('currentSession', function() {
		const date = this.get('currentSession.plannedStart');
		return `${this.get('intl').t('press-agenda')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),
});
