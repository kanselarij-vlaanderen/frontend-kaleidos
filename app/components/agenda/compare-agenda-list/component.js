import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  sessionService: inject(),
  agendaService: inject(),

  classNames: ['vlc-scroll-wrapper__body'],
  agendaToCompare: null,
  currentAgenda: null,
  currentAgendaGroups: null,
  agendaToCompareGroups: null,
  agendaOne: null,
  agendaTwo: null,

  isLoadingAgendaitems: computed('isLoadingAgendaOne', 'isLoadingAgendaTwo', function() {
    if (this.isLoadingAgendaOne) {
      return true;
    }
    if (this.isLoadingAgendaTwo) {
      return true;
    }
    return false;
  }),

  bothAgendasSelectedObserver: observer('agendaOne.id', 'agendaTwo.id', async function() {
    const { agendaOne, agendaTwo, agendaitemsLeft, agendaitemsRight } = this;
    const bothAgendasSelected = agendaOne && agendaTwo;

    if (bothAgendasSelected) {
      await this.creatCombinedAgendaitemList(agendaitemsLeft, agendaitemsRight);
      const newItems = await this.agendaService.reduceCombinedAgendaitemsByMandatees(
        this.combinedItems
      );
      this.set('combinedItems', newItems);
    }
  }),

  actions: {
    async chooseAgendaOne(agenda) {
      this.set('isLoadingAgendaOne', true);
      const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
      this.set('agendaitemsLeft', agendaitems);
      this.set('agendaOne', agenda);
      this.set('isLoadingAgendaOne', false);
    },
    async chooseAgendaTwo(agenda) {
      this.set('isLoadingAgendaTwo', true);
      const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
      this.set('agendaitemsRight', agendaitems);
      this.set('agendaTwo', agenda);
      this.set('isLoadingAgendaTwo', false);
    },
  },

  getAgendaitemsFromAgenda(id) {
    return this.store.query('agendaitem', {
      filter: {
        agenda: { id: id },
        'show-as-remark': false,
      },
      include: 'agenda,subcase,subcase.mandatees',
    });
  },

  async creatCombinedAgendaitemList(leftAgenda, rightAgenda) {
    const combinedItems = await Promise.all(
      leftAgenda.map(async (leftAgendaItem) => {
        const leftSubcaseId = await leftAgendaItem.get('subcase.id');

        const foundItem = rightAgenda.find(
          (rightAgendaItem) => rightAgendaItem.get('subcase.id') == leftSubcaseId
        );
        return { subcaseId: leftSubcaseId, left: leftAgendaItem, right: foundItem || null };
      })
    );

    await Promise.all(
      rightAgenda.map(async (rightAgendaItem) => {
        const rightSubcaseId = await rightAgendaItem.get('subcase.id');
        const foundItem = combinedItems.find(
          (combinedItem) => combinedItem.subcaseId == rightSubcaseId
        );

        if (!foundItem) {
          combinedItems.push({
            subcaseId: rightSubcaseId,
            left: null,
            right: rightAgendaItem,
          });
        }
      })
    );
    this.set('combinedItems', combinedItems);
  },
});
