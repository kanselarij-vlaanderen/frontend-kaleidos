import Model, { attr, belongsTo } from '@ember-data/model';
import sanitize from 'sanitize-filename';

export default class DraftFileModel extends Model {
  @attr uri;
  @attr filename;
  @attr format;
  @attr('number') size;
  @attr extension;
  @attr('datetime') created;

  @belongsTo('draft-file', { inverse: 'derived', async: true }) source;
  @belongsTo('draft-file', { inverse: 'source', async: true }) derived;

  get downloadFilename() {
    return sanitize(this.filename, {
      replacement: '_',
    });
  }

  get downloadLink() {
    return `/files/${this.id}/download`;
  }

  get inlineViewLink() {
    return `${this.namedDownloadLink}&content-disposition=inline`;
  }

  get namedDownloadLink() {
    return `${this.downloadLink}?name=${encodeURIComponent(
      this.downloadFilename
    )}`;
  }

  get filenameWithoutExtension() {
    const regex = new RegExp(`.${this.extension}$`);
    return this.filename.replace(regex, '');
  }
}
