import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaPressListSectionItemGroupComponent extends Component {
  @tracked isBekrachtiging;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    const agendaitem = this.args.items.at(0);
    const agendaActivity = await agendaitem.agendaActivity;
    const subcase = await agendaActivity?.subcase;
    await subcase?.type;
    this.isBekrachtiging = subcase?.isBekrachtiging;
  });

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
