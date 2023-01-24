import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
export default class Concept extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') altLabel;
  @attr('string') scopeNote;
  @attr('boolean') deprecated;
  @attr('number') position;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  // The idea behind also using broader is because ember was automatically connecting the broader parent under the narrower relation
  // Resulting in all concepts with 1 inverse narrower to break length == 0 checks on narrower
  @belongsTo('concept', { inverse: 'narrower', async: true }) broader;

  @hasMany('concept', { inverse: 'broader', async: true }) narrower;
  @hasMany('concept-scheme', { inverse: 'concepts', async: true })
  conceptSchemes;
  @hasMany('concept-scheme', { inverse: 'topConcepts', async: true })
  topConceptSchemes;
}
