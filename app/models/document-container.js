import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
export default class DocumentContainerModel extends Model {
  @attr uri;
  @attr('datetime') created;

  @belongsTo('concept') type;

  @hasMany('piece') pieces;
}
