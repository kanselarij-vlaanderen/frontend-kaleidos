import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Controller.extend({
  agendaService: inject(),
  sessionService: inject(),
  availableSubcases: A([]),
  postponedSubcases: A([]),
  currentSession: alias('sessionService.currentSession'),
  selectedAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),

  navigateBack() {
    const { currentSession, selectedAgenda  } = this;
    if (currentSession && selectedAgenda) {
      this.set('postponedSubcases', []);
      this.set('availableSubcases', []);
      const agendaId = currentSession.get('id');
      const selectedAgendaId = selectedAgenda.get('id');
      this.transitionToRoute('agenda.agendaitems', agendaId, { queryParams: { selectedAgenda: selectedAgendaId } });
    }
  },

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

      if (action === 'add') {
        postponed.pushObject(subcase)
      } else if (action === 'remove') {
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

      if (action === 'add') {
        available.pushObject(subcase)
      } else if (action === 'remove') {
        const index = available.indexOf(subcase);
        if (index > -1) {
          available.splice(index, 1);
        }
      }
    },

    navigateBackToAgenda() {
      this.navigateBack();
    },

    async addSubcasesToAgenda() {
      const {selectedAgenda, postponedSubcases, availableSubcases, agendaService} = this;
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

      const itemsToAdd = [...postponedSubcases, ...availableSubcases];
      console.log(itemsToAdd);
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
        this.navigateBack();
      });
    }
  },

  
});
