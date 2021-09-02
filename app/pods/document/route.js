import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }

  @action
  reloadModel() {
    super.refresh();
  }
}
