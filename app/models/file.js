import Model, { attr, belongsTo } from '@ember-data/model';
import sanitize from 'sanitize-filename';

export default class File extends Model {
  @attr uri;
  @attr('string') filename;
  @attr('string') format;
  @attr('number') size;
  @attr('string') extension;
  @attr('datetime') created;

  @belongsTo('file', { inverse: 'derived', async: true }) source;
  @belongsTo('file', { inverse: 'source', async: true }) derived;

  // *NOTE Don't use this getter, use filename instead
  // Possible unused getter since it had an error throwing 'deprecate' method for 2 months but no support issues were ever logged
  get name() {
    console.warn(
      `Attribute 'name' on 'file' model is deprecated. Use 'filename' instead.`
    );
    return this.filename;
  }

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
