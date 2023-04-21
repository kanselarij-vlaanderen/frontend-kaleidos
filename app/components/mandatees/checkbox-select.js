import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * @param {[Mandatee]} selected
 * @param {Agenda} referenceAgenda
 * @param {Function} onChange
 *
 * This component exposes a number of mandatees that are linked to an
 * agenda (through its agendaitems) as a checkbox listing of ministers.
 * If a minister is linked to an agenda through multiple mandatees, they
 * will be listed once and selecting said minister will select all of
 * their linked mandatees.
 *
 * E.g. if Jan Jambon is linked to an agendaitem as Minister-president
 * and as Vlaams minister to another agendaitem, this component will
 * list him once and selecting him will select both mandatees.
 */
export default class MandateesCheckboxSelect extends Component {
  @service store;

  @tracked ministers;
  @tracked selectedMandateesIds = this.args.selected || [];
  @tracked selectedMinisters = [];

  ministerToMandateeMap = new Map();

  constructor() {
    super(...arguments);

    this.loadMinisters.perform();
  }

  loadMinisters = task(async () => {
    if (this.args.referenceAgenda) {
      const mandatees = await this.store.query('mandatee', {
        'filter[agendaitems][agenda][:id:]': this.args.referenceAgenda.id,
        include: 'person',
        sort: 'priority',
      });
      const sortedMinisters = await Promise.all(
        mandatees.map(async (m) => {
          const person = await m.person;
          if (this.ministerToMandateeMap.has(person)) {
            this.ministerToMandateeMap.get(person).push(m);
          } else {
            this.ministerToMandateeMap.set(person, [m]);
          }
          return person;
        })
      );
      this.ministers = [...new Set(sortedMinisters)];
      if (this.selectedMandateesIds.length) {
        this.ministerToMandateeMap.forEach((mandatees, minister) => {
          if (mandatees.every((mandatee) => this.selectedMandateesIds.includes(mandatee.id))) {
            this.selectedMinisters.push(minister);
          }
        });
      }
    }
  });

  @action
  onChangeMinisters(ministers) {
    this.selectedMandateesIds = ministers.map((minister) => this.ministerToMandateeMap.get(minister).map((mandatee) => mandatee.id)).flat();
    this.args.onChange?.(this.selectedMandateesIds);
  }
}
