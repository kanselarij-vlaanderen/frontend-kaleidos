import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
}
