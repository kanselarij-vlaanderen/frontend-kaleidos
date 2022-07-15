import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';

export default class Meeting extends Model {
  @service store;
  @service intl;

  @attr uri;
  @attr('datetime') plannedStart;
  @attr('datetime') startedOn;
  @attr('datetime') endedOn;
  @attr location;
  @attr('number') number;
  @attr numberRepresentation;
  @attr('boolean') isFinal;
  @attr extraInfo;

  @hasMany('agenda', {
    inverse: null, serialize: false,
  }) agendas;
  @hasMany('subcase') requestedSubcases;
  @hasMany('piece') pieces;
  @hasMany('themis-publication-activity') themisPublicationActivities;

  @belongsTo('concept') kind;
  @belongsTo('meeting', {
    inverse: null,
  }) mainMeeting;
  @belongsTo('newsletter-info') newsletter;
  @belongsTo('mail-campaign') mailCampaign;
  @belongsTo('agenda', {
    inverse: null,
  }) agenda;

  @belongsTo('internal-decision-publication-activity') internalDecisionPublicationActivity;
  @belongsTo('internal-document-publication-activity') internalDocumentPublicationActivity;
  // TODO KAS-3431 concurrency issues can occur since these activities are created/edited by multiple people
  // do to not serialize this and only set meeting on themis-publication
  // read-only relation, reloads might be needed / use query on model with meetingid to avoid
  @hasMany('themis-publication-activity',  {
    serialize: false,
  }) themisPublicationActivities;


  get isPreKaleidos() {
    return this.plannedStart < KALEIDOS_START_DATE;
  }
}
