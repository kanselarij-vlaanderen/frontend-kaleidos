import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { CURRENT_GOVERNMENT_BODY } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0' // Minister
];

export default class MandateeSelectorComponent extends Component {
  @service store;
  @tracked mandatees;
  @tracked selectedMandatees;

  defaultQueryOptions = {
    'filter[government-body][:uri:]': CURRENT_GOVERNMENT_BODY,
    include: 'person,mandate.role',
    sort: 'priority',
  };

  constructor() {
    super(...arguments);
    this.initialLoad = this.loadVisibleRoles.perform();
    this.findAllMandatees.perform();
  }

  get readOnly() {
    return !!this.args.readOnly;
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.defaultQueryOptions['filter[mandate][role][:id:]'] = visibleRoles.map((role) => role.id).join(',');
  }

  @task
  *findAllMandatees() {
    if (this.initialLoad.isRunning) {
      yield this.initialLoad;
    }
    this.mandatees = yield this.store.query('mandatee', this.defaultQueryOptions);
  }

  @task
  *searchMandatees(title) {
    yield timeout(300);
    const queryOptions = {
      ...this.defaultQueryOptions,  // clone
    };
    queryOptions['filter[title]'] = title;
    const mandatees = yield this.store.query('mandatee', queryOptions);
    return mandatees;
  }

  @action
  chooseMandatee(mandatees) {
    this.selectedMandatees = mandatees;
    this.args.chooseMandatee(mandatees);
  }
}
