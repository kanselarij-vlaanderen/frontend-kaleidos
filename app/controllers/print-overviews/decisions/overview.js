import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Controller.extend({
	intl: inject(),
	queryParams: ['definite'],

	title: computed('model.currentAgenda.createdFor', function () {
		const date = this.get('model.currentAgenda.createdFor.plannedStart');
		return `${this.intl.t('decisions-of')} ${moment(date).utc().format('dddd DD-MM-YYYY')}`;
	}),
});
