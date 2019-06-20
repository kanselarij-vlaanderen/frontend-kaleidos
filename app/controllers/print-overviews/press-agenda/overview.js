import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
	intl: inject(),
	queryParams: ['definite'],

	title: computed('model.currentAgenda.createdFor', function () {
		const date = this.get('model.currentAgenda.createdFor.plannedStart');
		return `${this.intl.t('press-agenda')} ${moment(date).utc().format('dddd DD-MM-YYYY')}`;
	}),

	filteredGroups: computed('model', 'definite', async function () {
		return this.model.get('groups').then(agenda => {
			agenda.groups.map((group) => {
				const newAgendaitems = group.agendaitems.filter((item) => item.forPress);
			})
		})

	})
	// group.agendaitems = newAgendaitems.filter((item) => item).sortBy('priority');

	// if (group.agendaitems.get('length') < 1) {
	// 	agenda.groups = null;
	// }
});
