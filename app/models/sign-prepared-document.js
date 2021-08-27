import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignPreparedDocumentModel extends Model {
  @attr('string') documentId;
  @attr('string') packageId;

  @belongsTo signPrepareActivity;
  @belongsTo piece;
}
