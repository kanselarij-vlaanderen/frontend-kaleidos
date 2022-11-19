import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class Person extends Model {
  @attr('string') uri;
  @attr('string') firstName;
  @attr('string') lastName;

  @belongsTo('contact-person') contactPerson;
  @belongsTo('organization') organization;
  @hasMany('mandatee') mandatees;

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim(); // trim in case one of both is empty
  }
}
