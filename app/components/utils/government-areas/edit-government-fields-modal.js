import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class EditGovernmentAreasModal extends Component {
  @service store;
  @tracked governmentAreas;
  @tracked selectedGovernmentAreas;

  constructor() {
    super(...arguments);
    // const fields = this.store.query('government-field', {
    //   sort: 'priority',
    // });
    // const domains = this.store.query('government-domain', {
    //   sort: 'priority',
    // });
    this.selectedGovernmentAreas = this.args.governmentAreas?this.args.governmentAreas.slice(0):[]; // making a copy
  }

  @task
  *save() {
    yield this.args.onSave(
      this.selectedGovernmentAreas
    );
  }

  @action
  select(selectedAreas) {
    this.selectedGovernmentAreas.pushObjects(selectedAreas);
  }

  @action
  deselect(selectedAreas) {
    this.selectedGovernmentAreas.removeObjects(selectedAreas);
  }
}
