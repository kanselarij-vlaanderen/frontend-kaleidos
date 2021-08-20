import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';
import { isEmpty } from '@ember/utils';

export default class DocumentViewerRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    if (!isEmpty(ENV.APP.ENABLE_DOCUMENT_VIEW)) {
      this.transitionTo('document', transition.to.params.piece_id);
    }
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }
}
