import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    return await this.store.findRecord('publication-flow', params.publication_id, {
      reload: true,
    }, {
      include: 'case,person,status',
    });
  }
}
