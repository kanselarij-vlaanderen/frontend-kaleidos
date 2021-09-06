import Model, { attr, belongsTo } from '@ember-data/model';

export default class SigninghubDocumentModel extends Model {
  @attr('string') documentId;
  @attr('string') packageId;

  @belongsTo signPreparationActivity;
  @belongsTo piece;
}
