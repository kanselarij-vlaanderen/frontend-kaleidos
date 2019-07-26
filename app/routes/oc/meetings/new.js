import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  modelName: "oc-meeting",
  model() {
    return this.store.createRecord('oc-meeting', {});
  },
});