import Model, { attr, hasMany } from '@ember-data/model';

export default class PublicationMode extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') position;

  @hasMany('publication-flow', { inverse: 'mode', async: true })
  publicationFlow;
}
