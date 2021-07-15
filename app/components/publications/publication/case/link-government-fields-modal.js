import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';


export default class LinkGovernmentFieldsModal extends Component {
  @service store;
  @tracked governmentFields;
  @tracked governmentDomains;
  @tracked selectedGovernmentFields;

  constructor() {
    super(...arguments);
    this.governmentDomains = this.store.peekAll('government-domain').sortBy('position');
    this.governmentFields = this.store.peekAll('government-field').sortBy('position');
  }

  @task
  *saveRequest() {
    yield this.args.onSave(
      this.selectedGovernmentFields
    );
  }
}
