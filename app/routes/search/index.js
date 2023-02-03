import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexSearchRoute extends Route {
  @service router

  beforeModel() {
    this.router.transitionTo('search.agendaitems');
  }
}
