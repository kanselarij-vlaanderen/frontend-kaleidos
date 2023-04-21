import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class Person extends Model {
  @attr('string') uri;
  @attr('string') firstName;
  @attr('string') lastName;

  @belongsTo('contact-person', { inverse: 'person', async: true })
  contactPerson;
  @belongsTo('organization', { inverse: 'persons', async: true }) organization;
  @belongsTo('user', { inverse: 'person', async: true }) user;

  @hasMany('mandatee', { inverse: 'person', async: true }) mandatees;

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim(); // trim in case one of both is empty
  }
}
