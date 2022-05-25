import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SearchTabStorage extends Service {
  properties = new class {
    @tracked route = 'search.index';
  };

  get route() {
    return this.properties.route;
  }

  set route(route) {
    this.properties.route = route;
  }
}
