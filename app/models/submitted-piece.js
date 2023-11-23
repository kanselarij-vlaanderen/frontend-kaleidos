import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmittedPiece extends Model {
  @attr unsignedFile;
  @attr signedFile;
  @attr wordFile;
  @attr unsignedFileParliamentId;
  @attr signedFileParliamentId;
  @attr wordFileParliamentId;

  @belongsTo('piece', { inverse: null, async: true }) piece;
}
