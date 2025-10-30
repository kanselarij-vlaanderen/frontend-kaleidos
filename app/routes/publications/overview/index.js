import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class PublicationsOverviewIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('publications.overview.all');
  }
}
