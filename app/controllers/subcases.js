import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import $ from 'jquery';
import { computed } from '@ember/object';

export default Controller.extend(DefaultQueryParamsMixin, {
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
			this.navigateBack();
		},

		async addSubcasesToAgenda() {
			let selectedAgenda = await this.get('selectedAgenda');
			let itemsToAdd = await this.get('model');
			let promise = Promise.all(itemsToAdd.map(async subCase => {
				if (subCase.selected) {
					let agendaitem = this.store.createRecord('agendaitem', {
						extended: false,
						priority: 100,
						formallyOk:false,
						dateAdded: new Date(),
						subcase: subCase,
						agenda: selectedAgenda,
					});
          return new Promise((resolve, reject) => {
            agendaitem.save().then(agendaitem => {
              $.ajax(
                {
                  method: "POST",
                  url: `http://localhost/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
                  data: {
                  }
                }
              ).then(() => {
                resolve(agendaitem);
              }).catch(error => {
                reject(error);
              })
            });
          })
				}
			}));
			promise.then(() => {
				this.navigateBack();
			})
		}
	},

	navigateBack() {
		this.transitionToRoute('agendas');
	}
});
