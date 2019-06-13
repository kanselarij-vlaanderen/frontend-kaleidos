import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Mixin.create({
	intl: inject(),

	titleTranslationKey: null,
	titlePrintKey: null,

	title: computed('model.createdFor', 'titleTranslationKey', function () {
		const date = this.get('model.createdFor.plannedStart');
		return `${this.intl.t(`${this.titleTranslationKey}`)} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		async navigateBackToAgenda() {
			const currentSessionId = await this.get('model.createdFor.id');
			const selectedAgendaid = await this.get('model.id');
			this.transitionToRoute('agenda.agendaitems', currentSessionId, { queryParams: { selectedAgenda: selectedAgendaid } })
		},
		print() {
			var tempTitle = window.document.title;
			window.document.title = `${this.intl.t(`${this.titlePrintKey}`)}${moment(this.get('model.createdFor.plannedStart')).format('YYYYMMDD')}`;
			window.print();
			window.document.title = tempTitle;
		}
	}
});
