import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class IndexPublicationRoute extends Route.extend(AuthenticatedRouteMixin)  {
  beforeModel() {
    /* It is assumed here that explicitly navigating to the index-route
     * expresses a desire to "reset", to "start a new search-session".
     * Therefore all parameters except filters -such as "type" of agenda-item- are cleared.
     * We assume that those (checkbox-like) filters are specific to the user/session
     * and therefore are desired to be persisted. */
    /* TODO: If you go through this transition when already in a search (sub-) route, the queryParams
     * in the url get reset as requested, but you don't go through the model/setupController-hook
     * of the "search" route, even though the queryParams are marked `refreshModel: true`.
     * As a result "searchTextBuffer" doesn't get cleared.
     */
    this.transitionTo('publications.in-progress');
  }
}
