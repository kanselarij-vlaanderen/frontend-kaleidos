import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
// import 'moment/locale/nl'  // without this line it didn't work

export default Controller.extend({
	intl: inject(),
	
	title: computed('model.currentSession', function() {
		const date = this.get('model.currentSession.plannedStart');
		return `${this.get('intl').t('decisions-of')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		async navigateBackToAgenda() {
			const currentSessionId = await this.get('model.currentSession.id');
			const selectedAgendaid = this.get('selectedAgenda_id');
			this.transitionToRoute('agenda.agendaitems', currentSessionId, { queryParams: { selectedAgenda: selectedAgendaid } })
		},
		print() {
				var tempTitle = window.document.title;
				window.document.title = `${this.get('intl').t('decisions-pdf-name')}${moment(this.get('currentSession.plannenStart')).format('YYYYMMDD')}`;
				window.print();
				window.document.title = tempTitle;
		}
	}
});
