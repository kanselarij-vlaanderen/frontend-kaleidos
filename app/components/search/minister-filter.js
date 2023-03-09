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
  @tracked pastMinistersHidden = true;

  constructor() {
    super(...arguments);

    this.loadCurrentMinisters.perform();
  }

  get allCurrentMinistersSelected() {
    return this.currentMinisters.every((minister) => this.args.selected?.includes(minister.id));
  }

  get someCurrentMinistersSelected() {
    return this.currentMinisters.some((minister) => this.args.selected?.includes(minister.id));
  }

  get allPastMinistersSelected() {
    return this.pastMinisters.every((minister) => this.args.selected?.includes(minister.id));
  }

  get somePastMinistersSelected() {
    return this.pastMinisters.some((minister) => this.args.selected?.includes(minister.id));
  }

  _toggleMinister = (list, minister) => {
    const index = list.indexOf(minister.id);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(minister.id);
    }
    return list;
  }

  @action
  toggleMinister(minister) {
    const selected = [...this.args.selected];
    this.args.onChange?.(this._toggleMinister(selected, minister));
  }

  @action
  toggleAllCurrentMinisters() {
    const selected = [...this.args.selected];
    if (!this.allCurrentMinistersSelected && this.someCurrentMinistersSelected) {
      // Enable remaninig ministers
      this.currentMinisters.forEach((minister) => {
        if (!selected.includes(minister.id)) {
          selected.push(minister.id);
        }
      });
    } else {
      // Toggle all
      this.currentMinisters.forEach((minister) => this._toggleMinister(selected, minister));
    }
    this.args.onChange?.(selected);
  }

  @action
  toggleAllPastMinisters() {
    const selected = [...this.args.selected];
    if (!this.allPastMinistersSelected && this.somePastMinistersSelected) {
      this.pastMinisters.forEach((minister) => {
        if (!selected.includes(minister.id)) {
          selected.push(minister.id);
        }
      });
    } else {
      this.pastMinisters.forEach((minister) => this._toggleMinister(selected, minister));
    }
    this.args.onChange?.(selected);
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
      .filter((minister) => !this.currentMinisters.includes(minister))
      .filter((minister) => minister.uri.startsWith('http://themis.vlaanderen.be'));
  }
}
