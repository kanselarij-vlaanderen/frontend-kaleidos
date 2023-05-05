import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignedPieceModel extends Model {
  @attr title;
  @attr('datetime') created;

  @belongsTo('file', { inverse: null, async: true }) signedFile;
  @belongsTo('sign-completion-activity', {
    inverse: 'signedPiece',
    async: true,
  })
  signCompletionActivity;
}
