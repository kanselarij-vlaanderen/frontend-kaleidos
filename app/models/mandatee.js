import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class Mandatee extends Model {
  @attr('string') uri;
  @attr title;
  @attr newsletterTitle;
  @attr('number') priority;
  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('person', { inverse: 'mandatees', async: true }) person;
  @belongsTo('mandate', { inverse: 'mandatee', async: true }) mandate;

  @hasMany('submission-activity', { inverse: 'submitters', async: true })
  submissionActivities;
  @hasMany('subcase', { inverse: 'mandatees', async: true }) subcases;
  @hasMany('subcase', { inverse: 'requestedBy', async: true })
  requestedSubcases;
  @hasMany('agendaitem', { inverse: 'mandatees', async: true }) agendaitems;
  @hasMany('publication-flow', { inverse: 'mandatees', async: true })
  publicationFlows;
  @hasMany('sign-signing-activity', { inverse: 'mandatee', async: true })
  signSigningActivities;
  @hasMany('user-organization', { inverse: 'mandatees', async: true })
  organizations;
  @hasMany('meeting', { inverse: 'secretary', async: true }) secretaryForAgendas;
  @hasMany('decision-activity', { inverse: 'secretary', async: true }) secretaryForDecisions;

  get fullDisplayName() {
    const fullName = this.person.get('fullName');
    const title = this.title ?? this.mandate.get('role.label');
    if (fullName) {
      return `${fullName}, ${title}`;
    }
    return `${title}`;
  }

  get displayTitle() {
    const title = this.title ?? this.mandate.get('role.label');
    return `${title}`;
  }
}
