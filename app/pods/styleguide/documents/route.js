import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StyleguideDocumentsRoute extends Route {
  @service store;

  async model() {
    return (await this.store.query('piece', {
      'page[size]': 1,
      sort: '-created',
    })).firstObject;
  }
}
