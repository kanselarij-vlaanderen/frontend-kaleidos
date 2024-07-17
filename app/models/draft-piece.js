import Model, { attr, belongsTo } from '@ember-data/model';
import sanitize from 'sanitize-filename';

export default class DraftPiece extends Model {
  @attr uri;
  @attr name;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('concept', { inverse: null, async: true }) accessLevel;
  @belongsTo('draft-file', { inverse: null, async: true }) file;
  @belongsTo('draft-document-container', { inverse: 'pieces', async: true })
  documentContainer;
  @belongsTo('piece', { inverse: null, async: true, polymorphic: true }) previousPiece;
  @belongsTo('submission', { inverse: 'pieces', async: true }) submission;

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
      if (dirtyType == 'created') {
        // When saving a newly created record force the creation date to equal
        // the modified date.
        this.created = now;
      }
    }
    return super.save(...arguments);
  }
}
