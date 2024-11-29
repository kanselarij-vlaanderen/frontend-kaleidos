import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptSchemeModel extends Model {
  @attr uri;
  @attr label;

  @hasMany('concept', { inverse: 'conceptSchemes', async: true, polymorphic: true, as: 'concept-scheme' }) concepts;
  @hasMany('concept', { inverse: 'topConceptSchemes', async: true, polymorphic: true, as: 'concept-scheme' })
  topConcepts;
}
