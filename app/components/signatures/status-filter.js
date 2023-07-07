import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SignaturesStatusFilterComponent extends Component {
  @service intl;
  @service store;
  @tracked statusFilterItems = [];
  @tracked selectedStatuses = [];

  constructor() {
    super(...arguments);
    this.loadStatuses.perform();
  }

  @task
  *loadStatuses() {
    const statuses = yield this.store.query('concept', {
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.SIGNFLOW_STATUSES,
        },
      },
      sort: 'position',
    });
    if (statuses) {
      this.statusFilterItems = [];
      this.selectedStatuses = [];
      for (const status of statuses) {
        const statusItem = {
          label: status.label,
          value: status.id
        };
        this.statusFilterItems.push(statusItem);
        if (this.args.selectedStatusIds?.indexOf(statusItem.value) > -1) {
          this.selectedStatuses.push(statusItem);
        }
      }
    }
  }

  @action
  onChangeStatus(selectedItems) {
    this.selectedStatuses = selectedItems;
    if (isPresent(this.args.onChange)) {
      this.args.onChange(this.selectedStatuses.map(status => status.value));
    }
  }
}
