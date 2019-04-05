import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

import { computed } from '@ember/object';

export default Component.extend(DefaultQueryParamsMixin, {
  postponedSubcases: A([]),
  currentSession: alias('sessionService.currentSession'),
  selectedAgenda: alias('sessionService.currentAgenda'),
	agendas: alias('sessionService.agendas'),
	
	store: inject(),
	subcasesService: inject(),
	agendaService: inject(),
	sessionService: inject(),
	
	size:5,
	sort:'short-title',

	model: computed('store', 'sort', 'page', 'filter', 'size', function () {
    const { store, page, filter, size, sort } = this;
    const options = {
      sort: sort,
      page: {
        number: page,
        size: size
      },
      filter: {
        ':has-no:agendaitems': 'yes'
      }
    };
    if (filter) {
    options['filter'] = {
      ':has-no:agendaitems': 'yes',
      'short-title': filter,
    };
    }
    return store.query('subcase', options);
	}),
	
	async didInsertElement() {
		this._super(...arguments);
		const ids = await this.get('subcasesService').getPostPonedSubcaseIds();
		let postPonedSubcases = [];

		if (ids && ids.length > 0) {
			postPonedSubcases = await this.store.query('subcase', {
				filter: {
					"id": ids.toString()
				}
			});
		}
		this.set('postPonedSubcases', postPonedSubcases);
	},

	actions: {
		close() {
			this.set('isAddingAgendaitems', false);
		},

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

      if (action === 'add') {
        postponed.pushObject(subcase)
      } else if (action === 'remove') {
        const index = postponed.indexOf(subcase);
        if (index > -1) {
          postponed.splice(index, 1);
        }
      }
		},
		
		reloadRoute(id) {
			this.reloadRoute(id);
		},

    async addSubcasesToAgenda(selection, datatable) {
			datatable.clearSelection();
			
      selection.forEach(function (item) {
        item.set('selected', true);
			});

      const {selectedAgenda, postponedSubcases, agendaService} = this;
      const alreadySelected = await selectedAgenda.get('agendaitems');

      await Promise.all(postponedSubcases.map(async (item) => {
        const agendaitems = await item.get('agendaitems');
        agendaitems.map(async (agendaitem) => {
          const idx = await alreadySelected.indexOf(agendaitem);
          if (idx !== -1) {
            const postponed_obj = await agendaitem.get('postponedTo');
            if (postponed_obj) {
              await postponed_obj.set('agendaitem', null);
              await postponed_obj.destroyRecord();
              await agendaitem.set('retracted', false);
              await agendaitem.set('postponedTo', null);
              await agendaitem.save();
            } else {
              console.log('i never get here')
            }
          }
        });
      }));

      const itemsToAdd = [...postponedSubcases, ...selection];
      
      let promise = Promise.all(itemsToAdd.map(async (subCase) => {
        const agendaitems = await subCase.get('agendaitems');
        if (agendaitems.length === 0) {
          if (subCase.selected) {
            return agendaService.createNewAgendaItem(selectedAgenda, subCase);
          }
        }
      }));
      promise.then(async () => {
        const agendas = await this.get('agendas');
        if (agendas.length === 1) {
          return agendaService.sortAgendaItems(selectedAgenda);
        }
      }).then(() => {
				this.set('isAddingAgendaitems', false);
				this.reloadRoute(selectedAgenda.get('id'));
			});
		}
  }
});
