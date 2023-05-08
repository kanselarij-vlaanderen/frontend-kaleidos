import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignedPieceModel extends Model {
  @attr title;
  @attr('datetime') created;

  @belongsTo('piece', { inverse: 'signedPiece', async: true, polymorphic: true }) unsignedPiece;
  @belongsTo('file', { inverse: null, async: true }) signedFile;
  @belongsTo('sign-completion-activity', {
    inverse: 'signedPiece',
    async: true,
  })
  signCompletionActivity;
}
