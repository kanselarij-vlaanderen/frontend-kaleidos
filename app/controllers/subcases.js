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
  agendas: alias('sessionService.agendas'),

	actions: {
    async selectPostponed(subcase, event) {
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

			if (action === 'add'){
        postponed.pushObject(subcase)
      }else if (action === 'remove'){
        const index = postponed.indexOf(subcase);
        if (index > -1) {
          postponed.splice(index, 1);
        }
      }

		},
    async selectAvailableSubcase(subcase, destination, event) {
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

        const available = await this.get('availableSubcases');

        if (action === 'add'){
          available.pushObject(subcase)
        }else if (action === 'remove'){
          const index = available.indexOf(subcase);
          if (index > -1) {
            available.splice(index, 1);
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
      const alreadySelected = await selectedAgenda.get('agendaitems');

      await Promise.all(postponed.map(async (item) => {
        const agendaitems = await item.get('agendaitems');
        agendaitems.map(async (agendaitem) => {
          const idx = await alreadySelected.indexOf(agendaitem);
          if (idx !== -1){
            const postponed_obj = await agendaitem.get('postponedTo');
            if (postponed_obj){
              await postponed_obj.destroyRecord();
              agendaitem.set('postponedTo', null);
            }
          }

        });
      }));

      const itemsToAdd = [...postponed, ...available];

			let agendaService = this.get('agendaService');
			let promise = Promise.all(itemsToAdd.map(async (subCase) => {
        const agendaitems = await subCase.get('agendaitems');
        if (agendaitems.length === 0){
          if (subCase.selected) {
            return agendaService.createNewAgendaItem(selectedAgenda, subCase);
          }
        } else if (agendaitems.length > 0){
          agendaitems.map(async (agendaitem) => {
            const idx = await alreadySelected.indexOf(agendaitem);
            if (idx !== -1){
            }

          });
        }
			}));
			promise.then(async () => {
			  const agendas = await this.get('agendas');
			  if (agendas.length === 1){
          return agendaService.sortAgendaItems(selectedAgenda);
        }
			}).then(() => {
				this.navigateBack();
			});
		}
	},

	async navigateBack() {
		this.transitionToRoute('agendas');
	}
});
