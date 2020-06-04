import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import AgendaitemTableRouteMixin from 'fe-redpencil/mixins/light-table/agendaitem-table-route-mixin';

//TODO KAS-1425
export default Route.extend(AuthenticatedRouteMixin, AgendaitemTableRouteMixin, {
  authenticationRoute: 'login',
  routeNamePrefix: 'press-agenda',
  sort: 'priority',
  include: 'agenda-activity,agenda-activity.subcase'
});
