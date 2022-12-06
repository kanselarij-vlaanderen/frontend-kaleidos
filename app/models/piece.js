import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import sanitize from 'sanitize-filename';

export default class Piece extends Model {
  @attr('string') name;
  @attr('number') numberOfPages;
  @attr('number') numberOfWords;
  @attr('datetime') created;
  @attr('datetime') receivedDate;
  @attr('datetime') modified;
  @attr('datetime') accessLevelLastModified;

  @belongsTo('concept') accessLevel;
  @belongsTo('language') language;
  @belongsTo('file') file;
  @belongsTo('document-container', {
    inverse: null
  }) documentContainer;
  @belongsTo('piece', {
    inverse: 'previousPiece'
  }) nextPiece;
  @belongsTo('piece', {
    inverse: 'nextPiece'
  }) previousPiece;

  // resources with pieces linked:

  // Below relationship is only defined in frontend.
  // This definition is merely here to help ember-data with relationship bookkeeping,
  // so that when a piece gets deleted, the submissionActivity-piece relationships get updated.
  // The submission activity should never be sent to the backend from the piece-side
  // as long as the relationship is not defined in the backend.
  @belongsTo('submission-activity', {
    serialize: false
  }) submissionActivity;
  @belongsTo('decision-activity', {
    inverse: null
  }) decisionActivity;
  @belongsTo('news-item') newsItem;
  @belongsTo('meeting', {
    inverse: null
  }) meeting;

  @belongsTo('publication-flow') publicationFlow;
  @hasMany('request-activity', {
    inverse: 'usedPieces'
  }) requestActivitiesUsedBy;
  @hasMany('translation-activity', {
    inverse: 'usedPieces'
  }) translationActivitiesUsedBy;
  @belongsTo('translation-activity', {
    inverse: 'generatedPieces'
  }) translationActivityGeneratedBy;
  @hasMany('proofing-activity', {
    inverse: 'usedPieces'
  }) proofingActivitiesUsedBy;
  @belongsTo('proofing-activity', {
    inverse: 'generatedPieces'
  }) proofingActivityGeneratedBy;
  @hasMany('publication-activity', {
    inverse: 'usedPieces'
  }) publicationActivitiesUsedBy;

  // TODO: figure out if and why this is required. Delete otherwise
  @hasMany('case', {
    inverse: null
  }) cases;
  // serialize: false ensures the relation (which may contain stale data due to
  // custom service) is not send in patch calls
  @hasMany('agendaitem', {
    serialize: false,
    inverse: null,
  }) agendaitems;

  // SIGN FLOW
  @belongsTo('sign-marking-activity') signMarkingActivity;
  @belongsTo('signed-piece') signedPiece;


  get viewDocumentURL() {
    return `/document/${this.id}`;
  }

  get namedDownloadLinkPromise() {
    return this.file.then((file) => {
      if (file) {
        const filename = `${this.name}.${file.extension}`;
        const downloadFilename = sanitize(filename, {
          replacement: '_',
        });
        return `${file.downloadLink}?name=${encodeURIComponent(downloadFilename)}`;
      } else {
        return undefined;
      }
    });
  }

  save() {
    const dirtyType = this.dirtyType;
    if (dirtyType != 'deleted') {
      const now = new Date();
      this.modified = now;
      this.accessLevelLastModified = now;
    }
    return super.save(...arguments);
  }
}
