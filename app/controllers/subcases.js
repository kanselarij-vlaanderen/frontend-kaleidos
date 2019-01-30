import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Controller.extend(DefaultQueryParamsMixin, {
	agendaService: inject(),
	queryParams: ['agendaId'],
	allSubCasesSelected: false,

	selectedAgenda: computed('agendaId', function () {
		let agendaId = this.get('agendaId');
		return this.store.findRecord('agenda', agendaId, { reload: true });
	}),

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
			// set model null to refresh the model at navigation.
			this.set('model', null);
			this.navigateBack();
		},

		async addSubcasesToAgenda() {
			let selectedAgenda = await this.get('selectedAgenda');
			let itemsToAdd = await this.get('model');
			let promise = Promise.all(itemsToAdd.map(async subCase => {
				if (subCase.selected) {
					await this.get('agendaService').createNewAgendaItem(selectedAgenda, subCase);
				}
			}));
			promise.then(() => {
				this.navigateBack();
			})
		}
	},

	async navigateBack() {
		let agenda = await this.store.findRecord('agenda', this.get('agendaId'));
		let session = await agenda.get('session');
		this.transitionToRoute('agendas', {
			queryParams: {
				agendaId: this.get('agendaId'),
				sessionId: session.id
			}
		});
	}
});
