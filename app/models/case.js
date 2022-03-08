import Model, { attr, hasMany } from '@ember-data/model';

// Case should be a reserved word, so added "Model"
export default class CaseModel extends Model {
  @attr('datetime') created;
  @attr('string') title;
  @attr('string') shortTitle;
  @attr('string') number;
  @attr('boolean') isArchived;

  @hasMany('publication-flow') publicationFlows;
  @hasMany('concept') governmentAreas;
  // This relation is saved on subcase and should be read-only here
  @hasMany('subcase', {
    serialize: false,
  }) subcases;
  @hasMany('piece') pieces;
  @hasMany('sign-flow') signFlows;
}
