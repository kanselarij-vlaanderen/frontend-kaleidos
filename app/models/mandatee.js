import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class MandateeModel extends Model {
  @attr title;
  @attr newsletterTitle;
  @attr('number') priority;
  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('person') person;
  @belongsTo('mandate') mandate;

  // TODO We never use these and mandatee should be read-only
  // TODO Should we override the save function to do nothing?
  @hasMany('subcase', { inverse: null }) subcases;
  @hasMany('subcase', { inverse: null }) requestedSubcases;
  @hasMany('agendaitem', { inverse: null }) agendaitems;
  @hasMany('publication-flow', { inverse: null }) publicationFlows;
  @hasMany('sign-signing-activity', { inverse: null }) signSigningActivities;

  get fullDisplayName() {
    const fullName = this.person.get('fullName');
    const title = this.title ?? this.mandate.get('role.label');
    if (fullName) {
      return `${fullName}, ${title}`;
    }
    return `${title}`;
  }
}
