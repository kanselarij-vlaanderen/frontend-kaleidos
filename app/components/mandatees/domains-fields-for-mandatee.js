import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class MandateesDomainsFieldsForMandateeComponent extends Component {
  /**
   * Renderless component. Given a set of fields and a mandatee, this component will yield
   * only those of the supplied fields that are applicable for the given mandatee as well as the
   * domains the fields belong to.
   * @argument mandatee
   * @argument fields
   */
  @service store;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    let selectedMandateeFields = [];
    let selectedMandateeDomains = [];
    if (this.args.fields && this.args.fields.length) {
      let allMandateeFields = yield this.store.query('government-field', {
        'filter[ise-code][mandatees][:id:]': this.args.mandatee.id,
      });
      allMandateeFields = allMandateeFields.toArray();
      selectedMandateeFields = allMandateeFields.filter((field) => this.args.fields.includes(field));
      selectedMandateeDomains = yield Promise.all(selectedMandateeFields.map((field) => field.domain));
      selectedMandateeDomains = [...new Set(selectedMandateeDomains)]; // uniquify
    }
    return {
      mandatee: this.args.mandatee,
      domains: selectedMandateeDomains,
      fields: selectedMandateeFields,
    };
  }
}
