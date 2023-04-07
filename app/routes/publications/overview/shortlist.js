import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewShortlistRoute extends Route {
  @service store;

  async model() {
    const endpoint = '/publication-flows/shortlist';
    const response = await fetch(endpoint, {
      Headers: {
        'Accept': 'application/vnd.api+json',
      }
    });
    const result = await response.json();

    this.store.pushPayload('piece', result);
    const pieces = result.data.map(
      (record) => this.store.peekRecord('piece', record.id)
    );

    return {
      pieces,
    }
  }
}
