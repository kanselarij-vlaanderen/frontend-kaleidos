import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class DraftDocumentContainerModel extends Model {
  @attr uri;
  @attr('number') position;
  @attr('datetime') created;

  @belongsTo('document-type', { inverse: null, async: true}) type;

  @hasMany('draft-piece', { inverse: 'documentContainer', async: true })
  pieces;
}
