import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignedPieceModel extends Model {
  @attr title;
  @attr('datetime') created;

  @belongsTo('piece') unsignedPiece;
  @belongsTo('file') signedFile;
  @belongsTo('sign-completion-activity') signCompletionActivity;
}
