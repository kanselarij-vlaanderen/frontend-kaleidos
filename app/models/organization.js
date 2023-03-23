import Model, { attr, hasMany } from '@ember-data/model';

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') identifier;

  @hasMany('person', { inverse: 'organization', async: true }) persons;
  @hasMany('mandatee', {async: true}) mandatees;
}
