import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import $ from 'jquery';

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
						dateAdded: new Date(),
						subcase: subCase,
						agenda: selectedAgenda,
            priority: 0
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
              ).then(result => {
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
		this.transitionToRoute('sessions.session.agendas.agenda.agendaitems');
	}
});
