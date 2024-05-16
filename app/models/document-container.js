import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
export default class DocumentContainerModel extends Model {
  @attr uri;
  @attr('number') position;
  @attr('datetime') created;

  @belongsTo('concept', { inverse: null, async: true, polymorphic: true }) type;

  @hasMany('piece', {
    inverse: 'documentContainer',
    async: true,
    polymorphic: true,
  })
  pieces;
}
