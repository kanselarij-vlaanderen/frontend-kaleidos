import Model, { attr } from '@ember-data/model';

export default class PublicationReportType extends Model {
  @attr('string') uri;
  @attr('string') label;
}
