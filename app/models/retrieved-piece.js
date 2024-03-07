import Model, { attr, belongsTo } from '@ember-data/model';

export default class RetrievedPiece extends Model {
  @attr name;
  @attr comment;
  @attr unsignedFile;
  @attr signedFile;
  @attr wordFile;
  @attr unsignedFileParliamentId;
  @attr signedFileParliamentId;
  @attr wordFileParliamentId;

  @belongsTo('piece', {
    inverse: 'retrievedPieces',
    async: true,
    polymorphic: true
  })
  piece;
}
