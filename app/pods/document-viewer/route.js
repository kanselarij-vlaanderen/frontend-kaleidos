import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';
import { isEmpty } from '@ember/utils';

export default class DocumentViewerRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    if (!isEmpty(ENV.APP.ENABLE_DOCUMENT_VIEW)) {
      this.transitionTo('document', params.piece_id);
    }
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }
}
