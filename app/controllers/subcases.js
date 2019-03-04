import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Controller.extend(DefaultQueryParamsMixin, {
	agendaService: inject(),
	sessionService: inject(),
	allSubCasesSelected: false,
  availableSubcases: A([]),
  postponedSubcases: A([]),
	selectedAgenda: alias('sessionService.currentAgenda'),

	actions: {
    async selectSubcase(subcase, destination, event) {
			if (event) {
				event.stopPropagation();
			}

			let action = 'add';
			if (subcase.selected) {
				subcase.set('selected', false);
        action = 'remove';
			} else {
				subcase.set('selected', true);
        action = 'add';
			}

			const postponed = await this.get('postponedSubcases');
			const available = await this.get('availableSubcases');

			if (action === 'add'){
        if (destination === 'postponed'){
          postponed.pushObject(subcase)
        }else if (destination === 'available'){
          available.pushObject(subcase)
        }
      }else if (action === 'remove'){
        if (destination === 'postponed'){
          const index = postponed.indexOf(subcase);
          if (index > -1) {
            postponed.splice(index, 1);
          }
        }else if (destination === 'available'){
          const index = available.indexOf(subcase);
          if (index > -1) {
            available.splice(index, 1);
          }
        }
      }

		},

		selectAllSubCases() {
			this.get('model').forEach(subCase => {
				subCase.toggleProperty('selected');
			});
			this.toggleProperty('allSubCasesSelected');
		},
		navigateBackToAgenda() {
			this.set('model', null);
			this.navigateBack();
		},

		async addSubcasesToAgenda() {
			let selectedAgenda = await this.get('selectedAgenda');
      const postponed = await this.get('postponedSubcases');
      const available = await this.get('availableSubcases');
      const itemsToAdd = [...postponed, ...available];

			let agendaService = this.get('agendaService');
			let promise = Promise.all(itemsToAdd.map(async subCase => {
				if (subCase.selected) {
					return agendaService.createNewAgendaItem(selectedAgenda, subCase);
				}
			}));
			promise.then(() => {
				return agendaService.sortAgendaItems(selectedAgenda);
			}).then(() => {
				this.navigateBack();
			});
		}
	},

	async navigateBack() {
		this.transitionToRoute('agendas');
	}
});
