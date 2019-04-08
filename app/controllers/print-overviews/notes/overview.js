import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Controller.extend({
	intl: inject(),
	queryParams:['selectedAgenda_id'],

	title: computed('model.currentSession', async function() {
		const date = await this.get('model.currentSession.plannedStart');
		return `${this.get('intl').t('agenda-notes')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),
});
