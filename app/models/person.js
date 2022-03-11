import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { deprecatingAlias } from '@ember/object/computed'; // eslint-disable-line

export default class Person extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  // TODO: factor out this alias (kept in on purpose to keep merge conflicts low)
  @deprecatingAlias('fullName', {
    id: 'minister-migration.deprecate-alternativeName',
    until: 'unknown',
  })
  alternativeName;

  @belongsTo('contact-person') contactPerson;
  @belongsTo('organization') organization;
  @hasMany('mandatee') mandatees;

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim(); // trim in case one of both is empty
  }

  // TODO: factor out this alias (kept in on purpose to keep merge conflicts low)
  @deprecatingAlias('fullName', {
    id: 'minister-migration.deprecate-nameToDisplay',
    until: 'unknown',
  })
  nameToDisplay;
}
