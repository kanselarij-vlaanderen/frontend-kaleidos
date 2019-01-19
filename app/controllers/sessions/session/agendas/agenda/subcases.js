import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
	allSubCasesSelected: false,

	actions: {
		selectSubCase(subcase) {
			if (subcase.selected) {
				subcase.set('selected', false);
			} else {
				subcase.set('selected', true);
			}
		},

		selectAllSubCases() {
			let allSelected = this.get('allSubCasesSelected');
			this.get('model').forEach(subCase => {
				subCase.set('selected', !allSelected);
			});
			this.set('allSubCasesSelected', !allSelected);
		},

		navigateBackToAgenda() {
			this.transitionToRoute('sessions.session.agendas.agenda.agendaitems');
		},

		async addSubcasesToAgenda() {
			let selectedAgenda = this.get('selectedAgenda');
			this.get('model').forEach(subCase => {
				if (subCase.selected) {
					// Selected property added to show in the view
					// Removed cause it should not be send to the backend
					delete subCase.selected; 
					let agendaitem = this.store.createRecord('agendaitem', {
						extended: false,
						dateAdded: new Date(),
						subcase: subCase,
						agenda: selectedAgenda
					})
					agendaitem.save()
				}
			});
		}
	}
});
