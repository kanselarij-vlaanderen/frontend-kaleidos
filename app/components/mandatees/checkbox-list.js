import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';

/**
 * @param {[string]} selected
 * @param {Function} onChange
 * @param {Boolean} allowPartialMatch set the checkbox to checked even if only some mandatees are selected (only has impact on MP)
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

  isChecked = (minister) => {
    if (this.args.selected?.length) {
      if (this.args.allowPartialMatch) {
        return this.ministerToMandateeMap
          .get(minister)
          ?.some((m) => this.args.selected.includes(m.id));
      } else {
        return this.ministerToMandateeMap
          .get(minister)
          ?.every((m) => this.args.selected.includes(m.id));
      }
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
    const currentMandatees = await this.mandatees.getMandateesActiveOn.perform(
      startOfDay(new Date())
    );
    const sortedMandatees = currentMandatees.sort(
      (m1, m2) => m1.priority - m2.priority
    );
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
}
