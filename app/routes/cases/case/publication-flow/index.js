import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCasePublicationFlowIndexRoute extends Route {
  @service store;

  async model(params) {
    console.log('publication model');
   return await this.store.queryOne('publication-flow', {
    'filter[:id:]:': params.publication_id
   })
  }
}