import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';

/**
 * @param {[Mandatee]} selected
 * @param {Function} onChange
 */
export default class MandateesCheckboxListComponent extends Component {
  @service mandatees;
  @service store;

  @tracked ministers;

  currentMandatees;
  ministerToMandateeMap = new Map();

  constructor() {
    super(...arguments);

    this.loadMinisters.perform();
  }

  get allSelected() {
    return (
      this.args.selected?.length === this.currentMandatees.length &&
      this.currentMandatees
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

  getMinisterNameAndTitle = async (minister) => {
    const name = minister.fullName;
    const mandatees = this.ministerToMandateeMap.get(minister);
    const titles = await Promise.all(
      mandatees.map(async (m) => {
        if (m.title) {
          return m.title;
        }
        const mandate = await m.mandate;
        const role = await mandate.role;
        return role.label;
      })
    );
    return [name, ...titles].join(', ');
  };

  loadMinisters = task(async () => {
    const currentMandatees = await this.mandatees
                                       .getMandateesActiveOn
                                       .perform(startOfDay(new Date()));
    const sortedMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = await Promise.all(
      sortedMandatees.map(async (m) => {
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
      selected = this.currentMandatees.map((m) => m.id);
    }
    this.args.onChange?.(selected);
  }
}
