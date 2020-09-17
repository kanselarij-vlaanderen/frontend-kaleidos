import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const piece = params.piece_id;
    return this.store.findRecord('piece', piece);
  },
});
