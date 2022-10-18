import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action  } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

/**
 * @param selected {UserOrganization[]} List of organizations that are selected for filtering
 */
export default class OrganizationFilterComponent extends Component {
  @service store;

  @tracked selected;

  constructor() {
    super(...arguments);
    this.selected = this.args.selected;
  }

  @action
  toggleSelected([organization]) {
    if (this.selected.includes(organization)) {
      this.selected.splice(this.selected.indexOf(organization), 1);
    } else {
      this.selected.push(organization);
    }
    this.args.onChange?.(this.selected);
  }

  @task
  *search(query) {
    if (query) {
      yield timeout(500);
    }

    return (yield this.store.query('user-organization', {
      filter: query,
      sort: 'identifier',
    })).filter((organization) => !this.selected.includes(organization));
  }
}
