import Model, { attr } from '@ember-data/model';

export default class CaseType extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('boolean') deprecated;
};
