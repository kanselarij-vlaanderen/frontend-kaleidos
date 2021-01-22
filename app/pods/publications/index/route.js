import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    return this.store.query('publication-flow', {
      filter: {
        ':has:case': 'yes',
        case: {
          ':has-no:subcases': 'yes',
        },
      },
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'case',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
