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

  @belongsTo('concept', { inverse: null, async: true }) accessLevel;
  @belongsTo('language', { inverse: null, async: true }) language;
  @belongsTo('file', { inverse: null, async: true }) file;
  @belongsTo('document-container', { inverse: 'pieces', async: true })
  documentContainer;
  @belongsTo('piece', {
    inverse: 'previousPiece',
    async: true,
    polymorphic: true,
  })
  nextPiece;
  @belongsTo('piece', { inverse: 'nextPiece', async: true, polymorphic: true })
  previousPiece;
  @belongsTo('piece', {
    inverse: 'unsignedPiece',
    async: true,
    polymorphic: true,
  })
  signedPiece;
  @belongsTo('piece', {
    inverse: 'signedPiece',
    async: true,
    polymorphic: true,
  })
  unsignedPiece;

  // resources with pieces linked:

  @belongsTo('submission-activity', { inverse: 'pieces', async: true })
  submissionActivity;
  @belongsTo('meeting', { inverse: 'pieces', async: true }) meeting;
  @belongsTo('publication-flow', { inverse: 'referenceDocuments', async: true })
  publicationFlow;
  @belongsTo('proofing-activity', { inverse: 'generatedPieces', async: true })
  proofingActivityGeneratedBy;
  @belongsTo('translation-activity', {
    inverse: 'generatedPieces',
    async: true,
  })
  translationActivityGeneratedBy;
  @belongsTo('sign-marking-activity', { inverse: 'piece', async: true })
  signMarkingActivity;
  // @belongsTo('subcase', { inverse: 'linkedPieces', async: true }) linkedSubcase; // FIXME: This should be a hasMany
  @belongsTo('sign-completion-activity', {
    inverse: 'signedPiece',
    async: true,
  })
  signCompletionActivity;

  @hasMany('request-activity', { inverse: 'usedPieces', async: true })
  requestActivitiesUsedBy;
  @hasMany('translation-activity', { inverse: 'usedPieces', async: true })
  translationActivitiesUsedBy;
  @hasMany('proofing-activity', { inverse: 'usedPieces', async: true })
  proofingActivitiesUsedBy;
  @hasMany('publication-activity', { inverse: 'usedPieces', async: true })
  publicationActivitiesUsedBy;

  @hasMany('case', { inverse: 'pieces', async: true }) cases;
  @hasMany('agendaitem', { inverse: 'pieces', async: true }) agendaitems; // This relation may contain stale data due to custom service, so we don't serialize it
  @hasMany('agendaitem', { inverse: 'linkedPieces', async: true })
  linkedAgendaitems;

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
        return `${file.downloadLink}?name=${encodeURIComponent(
          downloadFilename
        )}`;
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
