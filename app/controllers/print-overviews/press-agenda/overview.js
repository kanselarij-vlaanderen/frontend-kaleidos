import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
	intl: inject(),
	queryParams: ['definite'],

	title: computed('model.currentAgenda.createdFor', function () {
		const date = this.get('model.currentAgenda.createdFor.plannedStart');
		return `${this.intl.t('press-agenda')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	})
});
