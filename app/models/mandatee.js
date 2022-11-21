import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class Mandatee extends Model {
  @attr title;
  @attr newsletterTitle;
  @attr('number') priority;
  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('person') person;
  @belongsTo('mandate') mandate;

  @hasMany('subcase', { inverse: 'mandatees' }) subcases;
  @hasMany('subcase', { inverse: 'requestedBy' }) requestedSubcases;
  @hasMany('agendaitem') agendaitems;
  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-signing-activity') signSigningActivities;

  get fullDisplayName() {
    const fullName = this.person.get('fullName');
    const title = this.title ?? this.mandate.get('role.label');
    if (fullName) {
      return `${fullName}, ${title}`;
    }
    return `${title}`;
  }
}
