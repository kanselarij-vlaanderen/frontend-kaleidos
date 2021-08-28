import Model, { attr, belongsTo } from '@ember-data/model';
import { deprecate } from '@ember/application/deprecations';
import sanitize from 'sanitize-filename';

export default class File extends Model {
  @attr('string') filename;
  @attr('string') format;
  @attr('number') size;
  @attr('string') extension;
  @attr('datetime') created;
  @attr('string') contentType;

  @belongsTo('piece') piece;

  get name() {
    deprecate(`Attribute 'name' on 'file' model is deprecated. Use 'filename' instead.`);
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

  get namedDownloadLink() {
    return `${this.downloadLink}?name=${encodeURIComponent(this.downloadFilename)}`;
  }

  get filenameWithoutExtension() {
    const regex = new RegExp(`.${this.extension}$`);
    return this.filename.replace(regex, '');
  }

  get canPreview() {
    const pdfMime =	'application/pdf';
    const pdfExtension = 'pdf';
    return this.format.toLowerCase().includes(pdfMime)
      || this.extension.toLowerCase == pdfExtension;
  }
}
