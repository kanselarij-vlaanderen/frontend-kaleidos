import Component from '@glimmer/component';
import { tracked }  from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';

export default class SearchMinisterFilterComponent extends Component {
  @service mandatees;
  @service store;

  @tracked currentMinisters = [];
  @tracked pastMinisters = [];
  @tracked _selected = null;
  @tracked pastMinistersHidden = true;

  constructor() {
    super(...arguments);

    this.loadCurrentMinisters.perform();
  }

  get selected() {
    return this._selected ?? this.args.selected ?? [];
  }

  set selected(selected) {
    this._selected = selected;
  }

  get allCurrentMinistersSelected() {
    return this.currentMinisters.every((minister) => this.selected.includes(minister));
  }

  get someCurrentMinistersSelected() {
    return this.currentMinisters.some((minister) => this.selected.includes(minister));
  }

  get allPastMinistersSelected() {
    return this.pastMinisters.every((minister) => this.selected.includes(minister));
  }

  get somePastMinistersSelected() {
    return this.pastMinisters.some((minister) => this.selected.includes(minister));
  }

  _toggleMinister = (minister) => {
    const index = this.selected.indexOf(minister);
    if (index >= 0) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(minister);
    }
  }

  @action
  toggleMinister(minister) {
    this._toggleMinister(minister);
    this.selected = [...this.selected];
    this.args.onChange?.(this.selected);
  }

  @action
  toggleAllCurrentMinisters() {
    if (!this.allCurrentMinistersSelected && this.someCurrentMinistersSelected) {
      // Enable remaninig ministers
      this.currentMinisters.forEach((minister) => {
        if (!this.selected.includes(minister)) {
          this.selected.push(minister);
        }
      });
    } else {
      // Toggle all
      this.currentMinisters.forEach(this._toggleMinister);
    }
    this.selected = [...this.selected];
    this.args.onChange?.(this.selected);
  }

  @action
  toggleAllPastMinisters() {
    if (!this.allPastMinistersSelected && this.somePastMinistersSelected) {
      this.pastMinisters.forEach((minister) => {
        if (!this.selected.includes(minister)) {
          this.selected.push(minister);
        }
      });
    } else {
      this.pastMinisters.forEach(this._toggleMinister);
    }
    this.selected = [...this.selected];
    this.args.onChange?.(this.selected);
  }

  @task
  *loadCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(startOfDay(new Date()));
    const sortedMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = yield Promise.all(
      sortedMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
    this.loadPastMinisters.perform();
  }

  @task
  *loadPastMinisters() {
    const allMinisters = yield this.store.queryAll('person', {
      'filter[:has:mandatees]': true,
      sort: 'last-name'
    });
    this.pastMinisters = allMinisters
      .filter((minister) => !this.currentMinisters.includes(minister));
  }
}
