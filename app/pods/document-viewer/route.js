import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class DocumentViewerRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const pieces = await this.store.query('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
    const piece = pieces.firstObject;
    return piece;
  }
}
