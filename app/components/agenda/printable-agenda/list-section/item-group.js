import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaPrintableAgendaListSectionItemGroupComponent extends Component {

  @tracked isBekrachtiging;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const agendaitem = this.args.items.at(0);
    const agendaActivity = yield agendaitem.agendaActivity;
    const subcase = yield agendaActivity?.subcase;
    yield subcase?.type;
    this.isBekrachtiging = subcase?.isBekrachtiging;
  }

  getPiecesForAgendaitem = async (agendaitem) => {
    let pieces = await agendaitem.pieces;
    pieces = pieces?.slice();
    const agendaActivity = await agendaitem.agendaActivity;
    await agendaActivity?.subcase;
    // TODO fix in KAS-4671, ratification was first document in agenda check
    // const subcase = await agendaActivity?.subcase;
    // if (this.isBekrachtiging) {
    //   const ratification = await subcase?.ratification;
    //   if (ratification) {
    //     pieces.push(ratification);
    //   }
    // }
    return pieces;
  };

  @use sortedMandateesFromFirst = resource(() => {
    const sortedMandatees = new TrackedArray([]);
    const calculateSortedMandatees = async () => {
      sortedMandatees.length = 0;
      const agendaitem = this.args.items.at(0);
      const mandatees = await agendaitem.mandatees;
      mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority)
        .forEach((mandatee) => sortedMandatees.push(mandatee));
    };
    calculateSortedMandatees();
    return sortedMandatees;
  });
}
