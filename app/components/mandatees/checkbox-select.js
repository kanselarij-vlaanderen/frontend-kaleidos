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

  mandatees;
  ministerToMandateeMap = new Map();

  constructor() {
    super(...arguments);

    this.loadMinisters.perform();
  }

  get allSelected() {
    return (
      this.args.selected?.length === this.mandatees.length &&
      this.mandatees
        .map((m) => m.id)
        .every((m) => this.args.selected?.includes(m))
    );
  }

  isChecked = (minister) => {
    if (this.args.selected?.length) {
      return this.ministerToMandateeMap
        .get(minister)
        ?.every((m) => this.args.selected.includes(m.id));
    }
    return false;
  };

  loadMinisters = task(async () => {
    if (this.args.referenceAgenda) {
      this.mandatees = await this.store.query('mandatee', {
        'filter[agendaitems][agenda][:id:]': this.args.referenceAgenda.id,
        include: 'person',
        sort: 'priority',
      });
      const sortedMinisters = await Promise.all(
        this.mandatees.map(async (m) => {
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
    }
  });

  @action
  toggle(minister) {
    const mandatees = this.ministerToMandateeMap.get(minister);
    if (mandatees?.length) {
      const selected = [...this.args.selected];
      for (const mandatee of mandatees) {
        const index = selected.indexOf(mandatee.id);
        if (index >= 0) {
          selected.splice(index, 1);
        } else {
          selected.push(mandatee.id);
        }
      }

      this.args.onChange?.(selected);
    }
  }

  @action
  toggleAll() {
    let selected = [];
    if (this.allSelected) {
      // Deselect all, leave selected empty
    } else {
      // Select all
      selected = this.mandatees.map((m) => m.id);
    }
    this.args.onChange?.(selected);
  }
}
