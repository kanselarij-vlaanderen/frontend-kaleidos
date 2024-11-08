import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmittedPiece extends Model {
  @attr name;
  @attr subcaseName;
  @attr('datetime') subcaseCreated;
  @attr unsignedFile;
  @attr signedFile;
  @attr wordFile;
  @attr unsignedFileParliamentId;
  @attr signedFileParliamentId;
  @attr wordFileParliamentId;

  @belongsTo('parliament-submission-activity', {
    inverse: 'submittedPieces',
    async: true,
  })
  parliamentSubmissionActivity;
  @belongsTo('piece', {
    inverse: 'submittedPieces',
    async: true,
    polymorphic: true,
  })
  piece;
}
