import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class ImpersonateUserModalComponent extends Component {
  @service impersonation;
  @service store;

  @tracked memberships;

  constructor() {
    super(...arguments);
    this.searchMemberships.perform();
  }

  @task
  *searchMemberships() {
    this.memberships = yield this.store.query('membership', {
      filter: {
        user: {
          account: {
            provider: 'https://github.com/kanselarij-vlaanderen/mock-login-service',
          }
        }
      },
      sort: 'user.last-name,user.first-name',
    });
  }
}
