import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';
export default class IseCode extends Model {
  @attr('string') name;
  @attr('string') code;
  @belongsTo('government-field') field;
  @hasMany('mandatee') mandatees;
  @hasMany('subcase') subcases;

  get nameToShow() {
    return `${this.name} - ${this.code}`;
  }
}
