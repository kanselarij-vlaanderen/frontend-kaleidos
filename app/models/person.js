import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';
import { deprecatingAlias } from '@ember/object/computed';

export default class Person extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
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

  @deprecatingAlias('fullName', {
    id: 'minister-migration.deprecate-nameToDisplay',
    until: 'unknown',
  })
  nameToDisplay;
}
