import Component from '@ember/component';
import { computed, observer } from '@ember/object';
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

  isLoadingAgendaitems: computed('isLoadingAgendaOne', 'isLoadingAgendaTwo', 'isLoadingComparison', function() {
    if (this.isLoadingAgendaOne || this.isLoadingAgendaTwo || this.isLoadingComparison) {
      return true;
    }
    return false;
  }),

  bothAgendasSelectedObserver: observer('agendaOne.id', 'agendaTwo.id', async function() {
    const { agendaOne, agendaTwo, agendaitemsLeft, agendaitemsRight } = this;
    const bothAgendasSelected = agendaOne && agendaTwo;

    if (bothAgendasSelected) {
      this.set('isLoadingComparison', true);
      this.set('combinedItems', []);
      await this.agendaService.agendaWithChanges(agendaOne.get('id'), agendaTwo.get('id'));
      const newItems = await this.agendaService.reduceComparison(
        await this.creatComparison(agendaitemsLeft, agendaitemsRight)
      );
      this.set('combinedItems', newItems);
      this.set('isLoadingComparison', false);
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

  async creatComparison(leftAgenda, rightAgenda) {
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
    return combinedItems;
  },
});
