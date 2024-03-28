import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import sanitize from 'sanitize-filename';

/**
 * !when adding a new inverse relation (piece belongsTo/hasMany someModel), make sure to add the polymorphic type {as: 'piece'}
 * !When setting the relation here or in the other model (someModel belongsTo/hasMany piece), make sure to add {polymorphic: true}
 * Referencing a relation between piece and piece requires both
 */

export default class Piece extends Model {
  @attr('string') uri;
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
  @belongsTo('document-container', { inverse: 'pieces', async: true, as: 'piece' })
  documentContainer;
  @belongsTo('piece', {
    inverse: 'previousPiece',
    async: true,
    polymorphic: true,
    as: 'piece'
  })
  nextPiece;
  @belongsTo('piece', { inverse: 'nextPiece', async: true, polymorphic: true, as: 'piece' })
  previousPiece;
  @belongsTo('piece', {
    inverse: 'unsignedPiece',
    async: true,
    polymorphic: true,
    as: 'piece'
  })
  signedPiece;
  @belongsTo('piece', {
    inverse: 'signedPiece',
    async: true,
    polymorphic: true,
    as: 'piece'
  })
  unsignedPiece;
  @belongsTo('piece', {
    inverse: 'signedPieceCopyOf',
    async: true,
    polymorphic: true,
    as: 'piece'
  })
  signedPieceCopy;
  @belongsTo('piece', {
    inverse: 'signedPieceCopy',
    async: true,
    polymorphic: true,
    as: 'piece'
  })
  signedPieceCopyOf;

  // resources with pieces linked:

  @belongsTo('submission-activity', { inverse: 'pieces', async: true, as: 'piece' })
  submissionActivity;
  @belongsTo('meeting', { inverse: 'pieces', async: true, as: 'piece' }) meeting;
  @belongsTo('publication-flow', { inverse: 'referenceDocuments', async: true, as: 'piece' })
  publicationFlow;
  @belongsTo('proofing-activity', { inverse: 'generatedPieces', async: true, as: 'piece' })
  proofingActivityGeneratedBy;
  @belongsTo('translation-activity', {
    inverse: 'generatedPieces',
    async: true,
    as: 'piece'
  })
  translationActivityGeneratedBy;
  @belongsTo('sign-marking-activity', { inverse: 'piece', async: true, as: 'piece' })
  signMarkingActivity;
  // @belongsTo('subcase', { inverse: 'linkedPieces', async: true }) linkedSubcase; // FIXME: This should be a hasMany
  @belongsTo('sign-completion-activity', {
    inverse: 'signedPiece',
    async: true,
    as: 'piece'
  })
  signCompletionActivity;
  @belongsTo('subcase', { inverse: 'ratification', async: true, as: 'piece' }) ratificationSubcase;

  @hasMany('request-activity', { inverse: 'usedPieces', async: true, as: 'piece' })
  requestActivitiesUsedBy;
  @hasMany('translation-activity', { inverse: 'usedPieces', async: true, as: 'piece' })
  translationActivitiesUsedBy;
  @hasMany('proofing-activity', { inverse: 'usedPieces', async: true, as: 'piece' })
  proofingActivitiesUsedBy;
  @hasMany('publication-activity', { inverse: 'usedPieces', async: true, as: 'piece' })
  publicationActivitiesUsedBy;

  @hasMany('case', { inverse: 'pieces', async: true, as: 'piece' }) cases;
  @hasMany('agendaitem', { inverse: 'pieces', async: true, as: 'piece' }) agendaitems; // This relation may contain stale data due to custom service, so we don't serialize it
  @hasMany('agendaitem', { inverse: 'linkedPieces', async: true, as: 'piece' })
  linkedAgendaitems;

  @hasMany('submitted-piece', {
    inverse: 'piece',
    async: true,
    as: 'piece'
  })
  submittedPieces;
  @hasMany('retrieved-piece', {
    inverse: 'piece',
    async: true,
    as: 'piece',
  })
  retrievedPieces;

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
      if (dirtyType == 'created') {
        // When saving a newly created record force the creation date to equal
        // the modified date.
        this.created = now;
      }
    }
    return super.save(...arguments);
  }
}
