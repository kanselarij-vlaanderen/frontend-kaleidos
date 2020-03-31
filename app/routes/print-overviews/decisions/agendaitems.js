import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import AgendaitemTableRouteMixin from 'fe-redpencil/mixins/light-table/agendaitem-table-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, AgendaitemTableRouteMixin, {
  authenticationRoute: 'login',
  routeNamePrefix: 'decisions',
  sort: 'priority',
  include: 'subcase,subcase.decisions'
});
