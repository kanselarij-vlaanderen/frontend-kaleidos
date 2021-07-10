import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';

export default class Person extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') alternativeName;

  @belongsTo('signature') signature;
  @belongsTo('contact-person') contactPerson;
  @hasMany('mandatee') mandatees;
  @belongsTo('organization') organization;

  get nameToDisplay() {
    const {
      alternativeName, firstName, lastName,
    } = this;
    if (alternativeName) {
      return alternativeName;
    } if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return '';
  }
}
