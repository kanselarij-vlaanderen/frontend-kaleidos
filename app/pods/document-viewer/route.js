import Route from '@ember/routing/route';

export default class DocumentViewerRoute extends Route {
  async model(params) {
    const pieces = await this.store.query('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
    const piece = pieces.firstObject;
    return piece;
  }
}
