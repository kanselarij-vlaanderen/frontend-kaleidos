import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
	intl: inject(),

	title: computed('currentSession', function () {
		const date = this.get('currentSession.plannedStart');
		return `${this.get('intl').t('press-agenda')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		async navigateBackToAgenda() {
			const currentSessionId = await this.get('model.currentSession.id');
			const selectedAgendaid = this.get('selectedAgenda_id');
			this.transitionToRoute('agenda.agendaitems', currentSessionId, { queryParams: { selectedAgenda: selectedAgendaid } })
		},

		print() {
			var tempTitle = window.document.title;
			window.document.title = `${this.get('intl').t('press-agenda-pdf-name')}${moment(this.get('currentSession.plannenStart')).format('YYYYMMDD')}`;
			window.print();
			window.document.title = tempTitle;
		}
	}
});
