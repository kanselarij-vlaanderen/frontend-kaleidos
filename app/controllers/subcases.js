import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
	allSubCasesSelected: false,

	actions: {
		selectSubCase(subcase, event) {
			if (event) {
				event.stopPropagation();
			}
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
			this.navigateBack();
		},

		addSubcasesToAgenda() {
			let selectedAgenda = this.get('selectedAgenda');
			let itemsToAdd = this.get('model');
			let promise = Promise.all(itemsToAdd.map(async subCase => {
				if (subCase.selected) {
					let agendaitem = this.store.createRecord('agendaitem', {
						extended: false,
						priority:-1,
						dateAdded: new Date(),
						subcase: subCase,
						agenda: selectedAgenda,
					});
					return await agendaitem.save();
				}
			}));
			promise.then(() => {
				this.navigateBack();
			})
		}
	},

	navigateBack() {
		this.transitionToRoute('agendas.agenda.agendaitems');
	}
});
