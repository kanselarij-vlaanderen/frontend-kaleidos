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
  @hasMany('subcase') subcases;
  @hasMany('piece') pieces;
  @hasMany('sign-flow') signFlows;
}
