import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';
export default class IseCode extends Model {
  @attr('string') name;
  @attr('string') code;
  @belongsTo('government-field') field;
  @hasMany('mandatee', {
    inverse: null,
  }) mandatees;
  @hasMany('subcase', {
    inverse: null,
  }) subcases;

  get nameToShow() {
    let name = this.name;
    if (this.code) {
      name += ` - ${this.code}`;
    }
    return name;
  }
}
